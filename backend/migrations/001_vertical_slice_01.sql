CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE membership_role AS ENUM ('COACH', 'STAFF', 'GUARDIAN');
CREATE TYPE record_status AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');
CREATE TYPE invitation_status AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');
CREATE TYPE link_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE availability_status AS ENUM ('CAN_ATTEND', 'CANNOT_ATTEND', 'UNSURE');
CREATE TYPE availability_source AS ENUM ('GUARDIAN_RECORDED', 'STAFF_RECORDED');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE team_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id),
  season_label text NOT NULL,
  category text NOT NULL,
  display_label text NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  UNIQUE (team_id, season_label)
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  team_season_id uuid NOT NULL REFERENCES team_seasons(id),
  role membership_role NOT NULL,
  status record_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, team_season_id, role)
);

CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  short_name text,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE roster_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id),
  team_season_id uuid NOT NULL REFERENCES team_seasons(id),
  shirt_number integer,
  position text,
  status record_status NOT NULL DEFAULT 'ACTIVE',
  UNIQUE (player_id, team_season_id)
);

CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_season_id uuid NOT NULL REFERENCES team_seasons(id),
  player_id uuid REFERENCES players(id),
  purpose text NOT NULL CHECK (purpose = 'GUARDIAN_LINK'),
  token_hash char(64) NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'ACTIVE',
  expires_at timestamptz NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE guardian_link_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id),
  requester_user_id uuid NOT NULL REFERENCES users(id),
  team_season_id uuid NOT NULL REFERENCES team_seasons(id),
  player_id uuid NOT NULL REFERENCES players(id),
  status link_request_status NOT NULL DEFAULT 'PENDING',
  reviewed_by_user_id uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_user_id, team_season_id, player_id)
);

CREATE TABLE guardian_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id uuid NOT NULL REFERENCES users(id),
  player_id uuid NOT NULL REFERENCES players(id),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guardian_user_id, player_id)
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_season_id uuid NOT NULL REFERENCES team_seasons(id),
  name text NOT NULL,
  event_type text NOT NULL,
  starts_at timestamptz NOT NULL,
  availability_enabled boolean NOT NULL DEFAULT false,
  availability_deadline timestamptz,
  availability_closed_at timestamptz,
  status text NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'))
);

CREATE TABLE availability_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id),
  player_id uuid NOT NULL REFERENCES players(id),
  status availability_status NOT NULL,
  source availability_source NOT NULL,
  actor_user_id uuid NOT NULL REFERENCES users(id),
  note text CHECK (char_length(note) <= 280),
  version integer NOT NULL CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, player_id)
);

CREATE TABLE availability_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES availability_responses(id),
  event_id uuid NOT NULL REFERENCES events(id),
  player_id uuid NOT NULL REFERENCES players(id),
  status availability_status NOT NULL,
  source availability_source NOT NULL,
  actor_user_id uuid NOT NULL REFERENCES users(id),
  note text CHECK (char_length(note) <= 280),
  version integer NOT NULL,
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (actor_user_id, idempotency_key)
);

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id),
  team_season_id uuid REFERENCES team_seasons(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX membership_scope_idx ON memberships(team_season_id, status, role);
CREATE INDEX roster_scope_idx ON roster_entries(team_season_id, status);
CREATE INDEX pending_links_idx ON guardian_link_requests(team_season_id, status, created_at);
CREATE INDEX event_scope_idx ON events(team_season_id, starts_at);
CREATE INDEX availability_event_idx ON availability_responses(event_id, player_id);
CREATE INDEX audit_scope_idx ON audit_events(team_season_id, created_at);
CREATE INDEX outbox_pending_idx ON outbox_events(created_at) WHERE published_at IS NULL;

-- RLS is intentionally deferred in VS01. Backend Policy is authoritative and
-- cross-team integration tests cover every exposed operation. ADR note explains
-- the request-scoped DB identity needed before RLS can be a meaningful defence.
