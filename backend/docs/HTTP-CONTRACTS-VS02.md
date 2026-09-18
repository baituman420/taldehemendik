# HTTP contracts — Vertical Slice 02

VS01 contracts remain valid. All mutations require Bearer auth, backend Policy authorization and JSON. Errors use stable `error.code` values.

## Events and agenda

| Operation | Request / response | Permission and consistency |
|---|---|---|
| `POST /team-seasons/{ts}/events` | Event fields → ACTIVE Event v1 | COACH/STAFF in `{ts}`; audit + `EventCreated` outbox |
| `GET /team-seasons/{ts}/events?from&to&limit` | chronological events | Active COACH/STAFF/GUARDIAN Membership in `{ts}` |
| `GET /events/{id}` | Event | Active Membership in Event TeamSeason |
| `PATCH /events/{id}` | partial fields + `expectedVersion` | COACH/STAFF; 409 on stale version; ACTIVE only |
| `POST /events/{id}/cancel` | CANCELLED Event | COACH/STAFF; closes Availability and cancels open ActionItems |
| `POST /events/{id}/complete` | COMPLETED Event | COACH/STAFF; closes Availability |

No recurrence is implemented. Each agenda item is an Event instance.

## Availability additions

`GET /events/{id}/availability` returns `counts` and player breakdown. `NO_RESPONSE` is derived. Mutations reject disabled, expired, closed, CANCELLED or COMPLETED Events. A called Player changing to `CANNOT_ATTEND` atomically creates at most one open `CALLED_PLAYER_UNAVAILABLE` ActionItem. Restoration auto-resolves it only when the same Callup revision still contains that Player.

## Callups

| Operation | Request / response | Semantics |
|---|---|---|
| `POST /events/{event}/callup` | `{playerIds}` → DRAFT + structured warnings | COACH/STAFF; Event ACTIVE and callupEnabled |
| `PATCH /callups/{id}/draft` | `{playerIds,expectedVersion}` | DRAFT only; optimistic concurrency |
| `POST /callups/{id}/publish` | `{expectedVersion,confirmWarnings[]}` + `Idempotency-Key` | Creates immutable revision 1; retry-safe |
| `POST /callups/{id}/revisions` | `{playerIds,expectedRevision,confirmWarnings[]}` | Published ACTIVE Callup; creates N+1 `MANUAL_UPDATE` snapshot |
| `GET /callups/{id}` | Callup + all immutable revisions | COACH/STAFF only |
| `POST /callups/{id}/cancel` | CANCELLED Callup | COACH/STAFF; ACTIVE Event only |
| `GET /events/{event}/players/{player}/callup-status` | permitted logistics + own called boolean | Authorized GUARDIAN for that Player only |

Selection rules: `CAN_ATTEND` allowed; `UNSURE` and `NO_RESPONSE` require keys `PLAYER_UNSURE:{playerId}` / `PLAYER_NO_RESPONSE:{playerId}`; `CANNOT_ATTEND` is rejected.

## Pending and replacement

| Operation | Contract |
|---|---|
| `GET /team-seasons/{ts}/pending` | persisted OPEN ActionItems + calculated `no_response` indicators |
| `GET /action-items/{id}/replacement-candidates` | ACTIVE same-TeamSeason roster, Player active, `CAN_ATTEND`, not in current revision; deterministic name order |
| `POST /action-items/{id}/replace` | `{substitutePlayerId,expectedCallupRevision}` → revision N+1 + RESOLVED action |

Replacement revalidates the open action, affected selection, current revision and substitute eligibility under row locks. It atomically snapshots the new revision, removes the affected Player, adds the substitute, resolves the ActionItem, audits and writes outbox.

## Added stable errors

`EVENT_VERSION_CONFLICT`, `EVENT_NOT_ACTIVE`, `CALLUP_NOT_ENABLED`, `CALLUP_VERSION_CONFLICT`, `CALLUP_WARNINGS_UNCONFIRMED`, `PLAYER_CANNOT_ATTEND`, `ACTION_ITEM_NOT_OPEN`, `SUBSTITUTE_NO_LONGER_ELIGIBLE`.
