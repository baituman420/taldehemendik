ALTER TABLE events RENAME COLUMN name TO title;
ALTER TABLE events RENAME COLUMN event_type TO type;
ALTER TABLE events ADD COLUMN arrival_at timestamptz;
ALTER TABLE events ADD COLUMN ends_at timestamptz;
ALTER TABLE events ADD COLUMN location text;
ALTER TABLE events ADD COLUMN notes text CHECK (char_length(notes) <= 2000);
ALTER TABLE events ADD COLUMN callup_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN created_by_user_id uuid REFERENCES users(id);
ALTER TABLE events ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE events ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE events ADD COLUMN version integer NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE events DROP CONSTRAINT events_status_check;
UPDATE events SET status='ACTIVE' WHERE status IN ('DRAFT','PUBLISHED');
ALTER TABLE events ADD CONSTRAINT events_status_check CHECK (status IN ('ACTIVE','CANCELLED','COMPLETED'));
ALTER TABLE events ADD CONSTRAINT events_type_check CHECK (type IN ('TRAINING','MATCH','TOURNAMENT','MEETING','OTHER'));
UPDATE events SET created_by_user_id=(SELECT user_id FROM memberships m WHERE m.team_season_id=events.team_season_id AND m.role='COACH' AND m.status='ACTIVE' LIMIT 1)
WHERE created_by_user_id IS NULL;
ALTER TABLE events ALTER COLUMN created_by_user_id SET NOT NULL;

CREATE TYPE callup_status AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');
CREATE TYPE callup_revision_origin AS ENUM ('INITIAL_PUBLICATION', 'MANUAL_UPDATE', 'REPLACEMENT');
CREATE TYPE action_item_status AS ENUM ('OPEN', 'RESOLVED', 'CANCELLED');
CREATE TYPE action_item_type AS ENUM ('CALLED_PLAYER_UNAVAILABLE');

CREATE TABLE callups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL UNIQUE REFERENCES events(id),
  team_season_id uuid NOT NULL REFERENCES team_seasons(id),
  status callup_status NOT NULL DEFAULT 'DRAFT',
  current_revision_number integer NOT NULL DEFAULT 0 CHECK (current_revision_number >= 0),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE callup_draft_selections (
  callup_id uuid NOT NULL REFERENCES callups(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id),
  PRIMARY KEY (callup_id, player_id)
);

CREATE TABLE callup_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  callup_id uuid NOT NULL REFERENCES callups(id),
  revision_number integer NOT NULL CHECK (revision_number > 0),
  origin callup_revision_origin NOT NULL,
  actor_user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (callup_id, revision_number)
);

CREATE TABLE callup_selections (
  revision_id uuid NOT NULL REFERENCES callup_revisions(id),
  player_id uuid NOT NULL REFERENCES players(id),
  PRIMARY KEY (revision_id, player_id)
);

CREATE TABLE action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_season_id uuid NOT NULL REFERENCES team_seasons(id),
  event_id uuid NOT NULL REFERENCES events(id),
  player_id uuid REFERENCES players(id),
  type action_item_type NOT NULL,
  status action_item_status NOT NULL DEFAULT 'OPEN',
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by_user_id uuid REFERENCES users(id)
);

CREATE UNIQUE INDEX one_open_action_per_cause
  ON action_items(event_id, player_id, type) WHERE status='OPEN';
CREATE INDEX callup_scope_idx ON callups(team_season_id, status);
CREATE INDEX action_item_scope_idx ON action_items(team_season_id, status, created_at);
