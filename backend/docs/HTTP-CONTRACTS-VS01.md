# HTTP contracts — Vertical Slice 01

Base: `/v1`. JSON only. Protected operations require `Authorization: Bearer <token>`.
Errors use `{ "error": { "code": "STABLE_CODE", "message": "..." } }`.

## Auth

| Operation | Request | Response | Permission / semantics |
|---|---|---|---|
| `POST /auth/otp/request` | `{email}` | `{challengeId}`; `developmentOtp` only when explicitly enabled | Rate limited; does not create authorization |
| `POST /auth/otp/verify` | `{email,challengeId,otp,displayName?}` | `{accessToken,user}` | Resolves/creates internal User through AuthAdapter |

The development adapter is replaceable. OTPs never enter audit/outbox. Access tokens are development credentials, not the future provider contract.

## Invitation and guardian link

| Operation | Request | Response | Permission / idempotency |
|---|---|---|---|
| `POST /team-seasons/{ts}/players/{p}/invitations` | empty | `{id,token,expiresAt}` | COACH in `{ts}`; plaintext token returned once |
| `GET /invitations/{token}` | — | safe Team/TeamSeason metadata | Public; never Player/roster/guardian PII |
| `POST /invitations/{token}/guardian-link-requests` | empty | pending request | Authenticated User; unique User+TeamSeason+Player |
| `GET /team-seasons/{ts}/guardian-link-requests` | — | pending requests | COACH only |
| `POST /guardian-link-requests/{id}/approve` | empty | approval receipt | COACH in request TeamSeason; natural-key idempotent |
| `POST /guardian-link-requests/{id}/reject` | empty | rejection receipt | COACH in request TeamSeason; natural-key idempotent |

Approval transaction: Membership GUARDIAN + GuardianLink + request status + Invitation state + audit + outbox. Any failure rolls all writes back.

## Player and availability

| Operation | Request | Response | Permission / concurrency |
|---|---|---|---|
| `GET /team-seasons/{ts}/players/{p}` | — | minimal operational Player context | COACH/STAFF in `{ts}`, or GUARDIAN satisfying all three access invariants |
| `GET /events/{e}/players/{p}/availability` | — | `{current,history}` | Same-team COACH/STAFF or authorized GUARDIAN for `{p}`; absence is `NO_RESPONSE`, version 0 |
| `GET /events/{e}/availability` | — | team roster with current status/actor/source/time | Same-TeamSeason COACH/STAFF |
| `PUT /events/{e}/players/{p}/availability` | `{status,expectedVersion}` | current response | Authorized GUARDIAN; optional `Idempotency-Key` |
| `PUT /events/{e}/players/{p}/availability/staff-recorded` | `{status,expectedVersion,note?}` | current response | Same-TeamSeason COACH/STAFF; source fixed to `STAFF_RECORDED` |

Statuses persisted: `CAN_ATTEND | CANNOT_ATTEND | UNSURE`. `NO_RESPONSE` is derived. A stale `expectedVersion` yields `409 AVAILABILITY_VERSION_CONFLICT`. Reusing an idempotency key with a different payload yields `409 IDEMPOTENCY_CONFLICT`.

## Stable domain errors

`AUTH_INVALID`, `INVITATION_INVALID`, `INVITATION_EXPIRED`, `LINK_REQUEST_ALREADY_EXISTS`, `GUARDIAN_LINK_REQUIRED`, `MEMBERSHIP_REQUIRED`, `PLAYER_NOT_ACCESSIBLE`, `AVAILABILITY_CLOSED`, `AVAILABILITY_VERSION_CONFLICT`, `PLAYER_NOT_IN_TEAMSEASON`, `ROLE_NOT_ALLOWED`, `IDEMPOTENCY_CONFLICT`.

Interactive OpenAPI documentation is exposed locally at `/documentation`. The Markdown contract is authoritative for domain semantics in VS01.
