import type pg from "pg";
import { DomainError } from "../domain/errors.js";

export async function requireRole(db: pg.Pool | pg.PoolClient, userId: string, teamSeasonId: string, roles: string[]) {
  const result = await db.query(
    `SELECT role FROM memberships WHERE user_id=$1 AND team_season_id=$2 AND status='ACTIVE' AND role = ANY($3::membership_role[])`,
    [userId, teamSeasonId, roles]
  );
  if (!result.rowCount) throw new DomainError("ROLE_NOT_ALLOWED", 403, "Role is not allowed for this operation");
  return result.rows[0].role as string;
}

export async function requireGuardianPlayerAccess(db: pg.Pool | pg.PoolClient, userId: string, teamSeasonId: string, playerId: string) {
  const membership = await db.query(
    `SELECT 1 FROM memberships WHERE user_id=$1 AND team_season_id=$2 AND role='GUARDIAN' AND status='ACTIVE'`,
    [userId, teamSeasonId]
  );
  if (!membership.rowCount) throw new DomainError("MEMBERSHIP_REQUIRED", 403, "Active guardian membership required");
  const access = await db.query(
    `SELECT 1 FROM guardian_links gl
      JOIN roster_entries re ON re.player_id=gl.player_id AND re.team_season_id=$2 AND re.status='ACTIVE'
      WHERE gl.guardian_user_id=$1 AND gl.player_id=$3 AND gl.status='ACTIVE'`,
    [userId, teamSeasonId, playerId]
  );
  if (!access.rowCount) throw new DomainError("GUARDIAN_LINK_REQUIRED", 403, "Active guardian link and roster entry required");
}

export async function requirePlayerInSeason(db: pg.Pool | pg.PoolClient, teamSeasonId: string, playerId: string) {
  const result = await db.query(
    `SELECT 1 FROM roster_entries WHERE team_season_id=$1 AND player_id=$2 AND status='ACTIVE'`,
    [teamSeasonId, playerId]
  );
  if (!result.rowCount) throw new DomainError("PLAYER_NOT_IN_TEAMSEASON", 422, "Player is not active in this team season");
}
