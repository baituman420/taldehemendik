import { createHash, randomBytes } from "node:crypto";
import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { z } from "zod";
import { pool, inTransaction } from "./db/pool.js";
import { DevelopmentAuthAdapter } from "./auth/development-adapter.js";
import type { AuthAdapter } from "./auth/adapter.js";
import { DomainError } from "./domain/errors.js";
import { requireGuardianPlayerAccess, requirePlayerInSeason, requireRole } from "./policy/authorization.js";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const emailSchema = z.string().email().max(254).transform((v) => v.toLowerCase());
const uuid = z.string().uuid();
const availability = z.enum(["CAN_ATTEND", "CANNOT_ATTEND", "UNSURE"]);

type BuildOptions = { authAdapter?: AuthAdapter };

export async function buildApp(options: BuildOptions = {}) {
  const auth = options.authAdapter ?? new DevelopmentAuthAdapter();
  const app = Fastify({ logger: false });
  await app.register(rateLimit, { max: 30, timeWindow: "1 minute" });
  await app.register(swagger, { openapi: { info: { title: "Talde Hemendik VS01", version: "0.1.0" } } });
  await app.register(swaggerUi, { routePrefix: "/documentation" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) return reply.code(error.statusCode).send({ error: { code: error.code, message: error.message } });
    if (error instanceof z.ZodError) return reply.code(400).send({ error: { code: "VALIDATION_ERROR", issues: error.issues } });
    if ((error as { code?: string }).code === "23505") return reply.code(409).send({ error: { code: "LINK_REQUEST_ALREADY_EXISTS", message: "Resource already exists" } });
    app.log.error(error);
    return reply.code(500).send({ error: { code: "INTERNAL_ERROR", message: "Internal error" } });
  });

  async function actor(request: { headers: Record<string, unknown> }) {
    const value = request.headers.authorization;
    if (typeof value !== "string" || !value.startsWith("Bearer ")) throw new DomainError("AUTH_INVALID", 401, "Bearer token required");
    return auth.verifyAccessToken(value.slice(7));
  }

  app.get("/health", async () => {
    await pool.query("SELECT 1");
    return { status: "ok" };
  });

  app.post("/v1/auth/otp/request", { config: { rateLimit: { max: 5, timeWindow: "5 minutes" } } }, async (request) => {
    const { email } = z.object({ email: emailSchema }).parse(request.body);
    return auth.requestOtp(email);
  });

  app.post("/v1/auth/otp/verify", { config: { rateLimit: { max: 10, timeWindow: "5 minutes" } } }, async (request) => {
    const body = z.object({ email: emailSchema, challengeId: uuid, otp: z.string().regex(/^\d{6}$/), displayName: z.string().min(1).max(100).optional() }).parse(request.body);
    const identity = await auth.verifyOtp(body.email, body.challengeId, body.otp);
    const result = await pool.query(
      `INSERT INTO users (auth_subject,email,display_name) VALUES ($1,$2,$3)
       ON CONFLICT (auth_subject) DO UPDATE SET email=EXCLUDED.email
       RETURNING id,email,display_name`,
      [identity.subject, identity.email, body.displayName ?? identity.email.split("@")[0]]
    );
    return { accessToken: auth.issueAccessToken(result.rows[0].id), user: result.rows[0] };
  });

  app.post("/v1/team-seasons/:teamSeasonId/players/:playerId/invitations", async (request, reply) => {
    const { userId } = await actor(request);
    const params = z.object({ teamSeasonId: uuid, playerId: uuid }).parse(request.params);
    await requireRole(pool, userId, params.teamSeasonId, ["COACH"]);
    await requirePlayerInSeason(pool, params.teamSeasonId, params.playerId);
    const plainToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 86400_000);
    const result = await inTransaction(async (db) => {
      const inserted = await db.query(
        `INSERT INTO invitations(team_season_id,player_id,purpose,token_hash,expires_at,created_by_user_id)
         VALUES($1,$2,'GUARDIAN_LINK',$3,$4,$5) RETURNING id,expires_at`,
        [params.teamSeasonId, params.playerId, tokenHash(plainToken), expiresAt, userId]
      );
      await db.query(`INSERT INTO audit_events(actor_user_id,team_season_id,action,entity_type,entity_id) VALUES($1,$2,'INVITATION_CREATED','Invitation',$3)`, [userId, params.teamSeasonId, inserted.rows[0].id]);
      return inserted.rows[0];
    });
    return reply.code(201).send({ id: result.id, token: plainToken, expiresAt: result.expires_at });
  });

  app.get("/v1/invitations/:token", async (request) => {
    const { token } = z.object({ token: z.string().min(16) }).parse(request.params);
    const result = await pool.query(
      `SELECT i.status,i.expires_at,i.purpose,t.name,ts.season_label,ts.display_label
       FROM invitations i JOIN team_seasons ts ON ts.id=i.team_season_id JOIN teams t ON t.id=ts.team_id
       WHERE i.token_hash=$1`, [tokenHash(token)]
    );
    if (!result.rowCount || result.rows[0].status !== "ACTIVE") throw new DomainError("INVITATION_INVALID", 404, "Invitation is invalid");
    if (new Date(result.rows[0].expires_at) <= new Date()) throw new DomainError("INVITATION_EXPIRED", 410, "Invitation has expired");
    const row = result.rows[0];
    return { team: { name: row.name }, teamSeason: { seasonLabel: row.season_label, displayLabel: row.display_label }, purpose: row.purpose };
  });

  app.post("/v1/invitations/:token/guardian-link-requests", async (request, reply) => {
    const { userId } = await actor(request);
    const { token } = z.object({ token: z.string().min(16) }).parse(request.params);
    const invitation = await pool.query(`SELECT * FROM invitations WHERE token_hash=$1 FOR UPDATE`, [tokenHash(token)]);
    if (!invitation.rowCount || invitation.rows[0].status !== "ACTIVE") throw new DomainError("INVITATION_INVALID", 404, "Invitation is invalid");
    if (new Date(invitation.rows[0].expires_at) <= new Date()) throw new DomainError("INVITATION_EXPIRED", 410, "Invitation has expired");
    const row = invitation.rows[0];
    const result = await inTransaction(async (db) => {
      const created = await db.query(
        `INSERT INTO guardian_link_requests(invitation_id,requester_user_id,team_season_id,player_id)
         VALUES($1,$2,$3,$4) RETURNING id,status,created_at`, [row.id, userId, row.team_season_id, row.player_id]
      );
      await db.query(`INSERT INTO audit_events(actor_user_id,team_season_id,action,entity_type,entity_id) VALUES($1,$2,'GUARDIAN_LINK_REQUEST_CREATED','GuardianLinkRequest',$3)`, [userId, row.team_season_id, created.rows[0].id]);
      return created.rows[0];
    });
    return reply.code(201).send(result);
  });

  app.get("/v1/team-seasons/:teamSeasonId/guardian-link-requests", async (request) => {
    const { userId } = await actor(request);
    const { teamSeasonId } = z.object({ teamSeasonId: uuid }).parse(request.params);
    await requireRole(pool, userId, teamSeasonId, ["COACH"]);
    const result = await pool.query(
      `SELECT r.id,r.status,r.created_at,u.id guardian_user_id,u.email,u.display_name,
              p.id player_id,p.first_name,p.last_name
       FROM guardian_link_requests r JOIN users u ON u.id=r.requester_user_id JOIN players p ON p.id=r.player_id
       WHERE r.team_season_id=$1 AND r.status='PENDING' ORDER BY r.created_at`, [teamSeasonId]
    );
    return { items: result.rows };
  });

  app.post("/v1/guardian-link-requests/:requestId/approve", async (request) => {
    const { userId } = await actor(request);
    const { requestId } = z.object({ requestId: uuid }).parse(request.params);
    return inTransaction(async (db) => {
      const found = await db.query(`SELECT * FROM guardian_link_requests WHERE id=$1 FOR UPDATE`, [requestId]);
      if (!found.rowCount) throw new DomainError("PLAYER_NOT_ACCESSIBLE", 404, "Link request not found");
      const row = found.rows[0];
      await requireRole(db, userId, row.team_season_id, ["COACH"]);
      if (row.status === "APPROVED") {
        const existing = await db.query(`SELECT id FROM guardian_links WHERE guardian_user_id=$1 AND player_id=$2`, [row.requester_user_id, row.player_id]);
        return { requestId, status: "APPROVED", guardianLinkId: existing.rows[0].id, idempotentReplay: true };
      }
      if (row.status !== "PENDING") throw new DomainError("IDEMPOTENCY_CONFLICT", 409, "Only pending requests can be approved");
      await db.query(`INSERT INTO memberships(user_id,team_season_id,role,status) VALUES($1,$2,'GUARDIAN','ACTIVE') ON CONFLICT(user_id,team_season_id,role) DO UPDATE SET status='ACTIVE'`, [row.requester_user_id, row.team_season_id]);
      const link = await db.query(`INSERT INTO guardian_links(guardian_user_id,player_id,status) VALUES($1,$2,'ACTIVE') ON CONFLICT(guardian_user_id,player_id) DO UPDATE SET status='ACTIVE' RETURNING id`, [row.requester_user_id, row.player_id]);
      await db.query(`UPDATE guardian_link_requests SET status='APPROVED',reviewed_by_user_id=$2,reviewed_at=now() WHERE id=$1`, [requestId, userId]);
      await db.query(`UPDATE invitations SET status='USED' WHERE id=$1`, [row.invitation_id]);
      await db.query(`INSERT INTO audit_events(actor_user_id,team_season_id,action,entity_type,entity_id) VALUES
        ($1,$2,'GUARDIAN_LINK_REQUEST_APPROVED','GuardianLinkRequest',$3),($1,$2,'GUARDIAN_LINK_ACTIVATED','GuardianLink',$4)`, [userId, row.team_season_id, requestId, link.rows[0].id]);
      await db.query(`INSERT INTO outbox_events(aggregate_type,aggregate_id,event_type,payload) VALUES('GuardianLink',$1,'GuardianLinkApproved',$2)`, [link.rows[0].id, JSON.stringify({ teamSeasonId: row.team_season_id, playerId: row.player_id, guardianUserId: row.requester_user_id })]);
      return { requestId, status: "APPROVED", guardianLinkId: link.rows[0].id, idempotentReplay: false };
    });
  });

  app.post("/v1/guardian-link-requests/:requestId/reject", async (request) => {
    const { userId } = await actor(request);
    const { requestId } = z.object({ requestId: uuid }).parse(request.params);
    return inTransaction(async (db) => {
      const found = await db.query(`SELECT * FROM guardian_link_requests WHERE id=$1 FOR UPDATE`, [requestId]);
      if (!found.rowCount) throw new DomainError("PLAYER_NOT_ACCESSIBLE", 404, "Link request not found");
      await requireRole(db, userId, found.rows[0].team_season_id, ["COACH"]);
      if (found.rows[0].status === "REJECTED") return { requestId, status: "REJECTED", idempotentReplay: true };
      if (found.rows[0].status !== "PENDING") throw new DomainError("IDEMPOTENCY_CONFLICT", 409, "Only pending requests can be rejected");
      await db.query(`UPDATE guardian_link_requests SET status='REJECTED',reviewed_by_user_id=$2,reviewed_at=now() WHERE id=$1`, [requestId, userId]);
      await db.query(`INSERT INTO audit_events(actor_user_id,team_season_id,action,entity_type,entity_id) VALUES($1,$2,'GUARDIAN_LINK_REQUEST_REJECTED','GuardianLinkRequest',$3)`, [userId, found.rows[0].team_season_id, requestId]);
      return { requestId, status: "REJECTED", idempotentReplay: false };
    });
  });

  app.get("/v1/team-seasons/:teamSeasonId/players/:playerId", async (request) => {
    const { userId } = await actor(request);
    const params = z.object({ teamSeasonId: uuid, playerId: uuid }).parse(request.params);
    try { await requireRole(pool, userId, params.teamSeasonId, ["COACH", "STAFF"]); }
    catch { await requireGuardianPlayerAccess(pool, userId, params.teamSeasonId, params.playerId); }
    const result = await pool.query(
      `SELECT p.id,p.first_name,p.last_name,p.short_name,re.shirt_number,re.position,ts.id team_season_id
       FROM players p JOIN roster_entries re ON re.player_id=p.id JOIN team_seasons ts ON ts.id=re.team_season_id
       WHERE p.id=$1 AND ts.id=$2 AND re.status='ACTIVE'`, [params.playerId, params.teamSeasonId]
    );
    if (!result.rowCount) throw new DomainError("PLAYER_NOT_ACCESSIBLE", 404, "Player is not accessible");
    return result.rows[0];
  });

  async function eventContext(eventId: string, playerId: string, db: typeof pool | import("pg").PoolClient = pool) {
    const result = await db.query(
      `SELECT e.*,re.status roster_status FROM events e JOIN roster_entries re ON re.team_season_id=e.team_season_id AND re.player_id=$2 WHERE e.id=$1`,
      [eventId, playerId]
    );
    if (!result.rowCount || result.rows[0].roster_status !== "ACTIVE") throw new DomainError("PLAYER_NOT_IN_TEAMSEASON", 422, "Player is not in event team season");
    return result.rows[0];
  }

  async function setAvailability(args: { eventId: string; playerId: string; userId: string; status: string; expectedVersion: number; source: string; note?: string; idempotencyKey?: string }) {
    return inTransaction(async (db) => {
      const event = await eventContext(args.eventId, args.playerId, db);
      if (!event.availability_enabled || event.availability_closed_at || (event.availability_deadline && new Date(event.availability_deadline) <= new Date())) throw new DomainError("AVAILABILITY_CLOSED", 409, "Availability is closed");
      const duplicate = args.idempotencyKey ? await db.query(`SELECT ar.* FROM availability_history h JOIN availability_responses ar ON ar.id=h.response_id WHERE h.actor_user_id=$1 AND h.idempotency_key=$2`, [args.userId, args.idempotencyKey]) : { rowCount: 0, rows: [] };
      if (duplicate.rowCount) {
        const prior = duplicate.rows[0];
        if (prior.status !== args.status || prior.source !== args.source || (prior.note ?? undefined) !== args.note) {
          throw new DomainError("IDEMPOTENCY_CONFLICT", 409, "Idempotency key was already used with a different payload");
        }
        return { ...prior, idempotentReplay: true };
      }
      const current = await db.query(`SELECT * FROM availability_responses WHERE event_id=$1 AND player_id=$2 FOR UPDATE`, [args.eventId, args.playerId]);
      const actualVersion = current.rowCount ? current.rows[0].version : 0;
      if (actualVersion !== args.expectedVersion) throw new DomainError("AVAILABILITY_VERSION_CONFLICT", 409, `Expected version ${args.expectedVersion}, current version ${actualVersion}`);
      const nextVersion = actualVersion + 1;
      const response = await db.query(
        `INSERT INTO availability_responses(event_id,player_id,status,source,actor_user_id,note,version,updated_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,now())
         ON CONFLICT(event_id,player_id) DO UPDATE SET status=EXCLUDED.status,source=EXCLUDED.source,actor_user_id=EXCLUDED.actor_user_id,note=EXCLUDED.note,version=EXCLUDED.version,updated_at=now()
         RETURNING *`, [args.eventId, args.playerId, args.status, args.source, args.userId, args.note ?? null, nextVersion]
      );
      const row = response.rows[0];
      await db.query(`INSERT INTO availability_history(response_id,event_id,player_id,status,source,actor_user_id,note,version,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [row.id,args.eventId,args.playerId,args.status,args.source,args.userId,args.note ?? null,nextVersion,args.idempotencyKey ?? null]);
      await db.query(`INSERT INTO audit_events(actor_user_id,team_season_id,action,entity_type,entity_id,metadata) VALUES($1,$2,$3,'AvailabilityResponse',$4,$5)`, [args.userId,event.team_season_id,args.source === "STAFF_RECORDED" ? "AVAILABILITY_DELEGATED" : "AVAILABILITY_CHANGED",row.id,JSON.stringify({ version: nextVersion, source: args.source })]);
      await db.query(`INSERT INTO outbox_events(aggregate_type,aggregate_id,event_type,payload) VALUES('AvailabilityResponse',$1,'AvailabilityChanged',$2)`, [row.id,JSON.stringify({ eventId: args.eventId, playerId: args.playerId, status: args.status, version: nextVersion })]);
      return { ...row, idempotentReplay: false };
    });
  }

  app.put("/v1/events/:eventId/players/:playerId/availability", async (request) => {
    const { userId } = await actor(request);
    const params = z.object({ eventId: uuid, playerId: uuid }).parse(request.params);
    const body = z.object({ status: availability, expectedVersion: z.number().int().min(0) }).parse(request.body);
    const event = await eventContext(params.eventId, params.playerId);
    await requireGuardianPlayerAccess(pool, userId, event.team_season_id, params.playerId);
    return setAvailability({ ...params, userId, ...body, source: "GUARDIAN_RECORDED", idempotencyKey: request.headers["idempotency-key"] as string | undefined });
  });

  app.put("/v1/events/:eventId/players/:playerId/availability/staff-recorded", async (request) => {
    const { userId } = await actor(request);
    const params = z.object({ eventId: uuid, playerId: uuid }).parse(request.params);
    const body = z.object({ status: availability, expectedVersion: z.number().int().min(0), note: z.string().max(280).optional() }).parse(request.body);
    const event = await eventContext(params.eventId, params.playerId);
    await requireRole(pool, userId, event.team_season_id, ["COACH", "STAFF"]);
    return setAvailability({ ...params, userId, ...body, source: "STAFF_RECORDED", idempotencyKey: request.headers["idempotency-key"] as string | undefined });
  });

  app.get("/v1/events/:eventId/availability", async (request) => {
    const { userId } = await actor(request);
    const { eventId } = z.object({ eventId: uuid }).parse(request.params);
    const event = await pool.query(`SELECT team_season_id FROM events WHERE id=$1`, [eventId]);
    if (!event.rowCount) throw new DomainError("PLAYER_NOT_ACCESSIBLE", 404, "Event not found");
    await requireRole(pool, userId, event.rows[0].team_season_id, ["COACH", "STAFF"]);
    const result = await pool.query(
      `SELECT p.id player_id,p.first_name,p.last_name,COALESCE(ar.status::text,'NO_RESPONSE') status,
              ar.version,ar.source,ar.actor_user_id,ar.updated_at
       FROM roster_entries re JOIN players p ON p.id=re.player_id
       LEFT JOIN availability_responses ar ON ar.player_id=p.id AND ar.event_id=$1
       WHERE re.team_season_id=$2 AND re.status='ACTIVE' ORDER BY p.last_name,p.first_name`, [eventId,event.rows[0].team_season_id]
    );
    return { items: result.rows };
  });

  app.get("/v1/events/:eventId/players/:playerId/availability", async (request) => {
    const { userId } = await actor(request);
    const params = z.object({ eventId: uuid, playerId: uuid }).parse(request.params);
    const event = await eventContext(params.eventId, params.playerId);
    try { await requireRole(pool, userId, event.team_season_id, ["COACH", "STAFF"]); }
    catch { await requireGuardianPlayerAccess(pool, userId, event.team_season_id, params.playerId); }
    const current = await pool.query(`SELECT * FROM availability_responses WHERE event_id=$1 AND player_id=$2`, [params.eventId,params.playerId]);
    const history = await pool.query(`SELECT status,source,actor_user_id,note,version,created_at FROM availability_history WHERE event_id=$1 AND player_id=$2 ORDER BY version`, [params.eventId,params.playerId]);
    return { current: current.rowCount ? current.rows[0] : { eventId: params.eventId, playerId: params.playerId, status: "NO_RESPONSE", version: 0 }, history: history.rows };
  });

  return app;
}
