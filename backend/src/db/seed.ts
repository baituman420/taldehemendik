import { pool } from "./pool.js";
import { ids } from "./ids.js";

await pool.query("BEGIN");
try {
  await pool.query(`TRUNCATE audit_events, outbox_events, availability_history, availability_responses, events,
    guardian_links, guardian_link_requests, invitations, roster_entries, players, memberships, team_seasons, teams, users CASCADE`);
  await pool.query(`INSERT INTO users (id, auth_subject, email, display_name) VALUES
    ($1, 'dev-email:mikel@example.test', 'mikel@example.test', 'Mikel Zubeldia'),
    ($2, 'dev-email:staff@example.test', 'staff@example.test', 'Ane Staff'),
    ($3, 'dev-email:coach-b@example.test', 'coach-b@example.test', 'Coach B')`, [ids.coach, ids.staff, ids.otherCoach]);
  await pool.query(`INSERT INTO teams (id, name) VALUES ($1, 'CD Oyón'), ($2, 'Equipo B')`, [ids.team, ids.otherTeam]);
  await pool.query(`INSERT INTO team_seasons (id, team_id, season_label, category, display_label, status) VALUES
    ($1, $2, '2026/27', 'Infantil', 'Infantil A', 'ACTIVE'),
    ($3, $4, '2026/27', 'Infantil', 'Infantil B', 'ACTIVE')`, [ids.season, ids.team, ids.otherSeason, ids.otherTeam]);
  await pool.query(`INSERT INTO memberships (user_id, team_season_id, role) VALUES
    ($1, $2, 'COACH'), ($3, $2, 'STAFF'), ($4, $5, 'COACH')`, [ids.coach, ids.season, ids.staff, ids.otherCoach, ids.otherSeason]);
  await pool.query(`INSERT INTO players (id, team_id, first_name, last_name) VALUES
    ($1, $2, 'Ibai', 'Aranguren'), ($3, $4, 'Otro', 'Jugador')`, [ids.ibai, ids.team, ids.otherPlayer, ids.otherTeam]);
  await pool.query(`INSERT INTO roster_entries (player_id, team_season_id, shirt_number) VALUES
    ($1, $2, 9), ($3, $4, 7)`, [ids.ibai, ids.season, ids.otherPlayer, ids.otherSeason]);
  await pool.query(`INSERT INTO events (id, team_season_id, name, event_type, starts_at, availability_enabled, availability_deadline, status)
    VALUES ($1, $2, 'Torneo Oyón', 'TOURNAMENT', now() + interval '14 days', true, now() + interval '12 days', 'PUBLISHED')`, [ids.event, ids.season]);
  await pool.query(`INSERT INTO events (id, team_season_id, name, event_type, starts_at, availability_enabled, availability_deadline, status)
    VALUES ($1, $2, 'Evento Equipo B', 'TRAINING', now() + interval '14 days', true, now() + interval '12 days', 'PUBLISHED')`, [ids.otherEvent, ids.otherSeason]);
  await pool.query(`INSERT INTO invitations(team_season_id,player_id,purpose,token_hash,expires_at,created_by_user_id)
    VALUES($1,$2,'GUARDIAN_LINK',encode(digest('public-token-seeded-for-local-tests','sha256'),'hex'),now()+interval '7 days',$3)`, [ids.season, ids.ibai, ids.coach]);
  await pool.query("COMMIT");
} catch (error) {
  await pool.query("ROLLBACK");
  throw error;
}
await pool.end();
console.log(JSON.stringify({ event: "database.seeded", dataset: "vs01" }));
