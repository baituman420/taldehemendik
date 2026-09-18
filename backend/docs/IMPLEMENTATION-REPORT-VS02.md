# Vertical Slice 02 — implementation report

## Delivered

- Event/Agenda lifecycle and weekly/range queries.
- Availability summary integrated with Event capabilities/deadline/status.
- Independent Callup aggregate with draft, immutable revisions and selection snapshots.
- Structured warnings and explicit confirmation.
- Persisted `CALLED_PLAYER_UNAVAILABLE` ActionItem plus calculated no-response indicator.
- Deterministic replacement candidates without recommendation logic.
- Transactional replacement and optimistic concurrency.
- Restoration and Event cancellation rules.
- Audit and transactional outbox across the sequence.

## New invariants

1. Event capabilities gate Availability and Callup operations.
2. CANCELLED/COMPLETED Event is historical and rejects ordinary operational mutations.
3. Current Callup is exactly the snapshot referenced by `current_revision_number`; old revisions never mutate.
4. `CANNOT_ATTEND` cannot enter a Callup through draft, publication or revision.
5. `UNSURE/NO_RESPONSE` require structured explicit warning confirmation at publication/revision time.
6. At most one OPEN unavailable-player ActionItem exists for Event+Player+type.
7. Availability never removes a Player from Callup automatically.
8. Restored availability auto-resolves only if the originating revision is still current and contains the Player.
9. Replacement candidate lists are advisory; eligibility is revalidated transactionally.
10. Replacement requires the expected current revision and never overwrites a concurrent revision.
11. Replacement creates N+1, resolves the ActionItem and writes audit/outbox atomically.
12. Cancelling Event cancels related open ActionItems and closes Availability without deletion.

## Scope decisions

- The requested numbers `14 CAN_ATTEND + 2 CANNOT_ATTEND + 2 NO_RESPONSE`, a 12-player Callup and three eligible substitutes are simultaneously possible because the initial 12 include 11 available Players plus one explicitly confirmed `NO_RESPONSE`; Ane, Nahia and Irati remain the three available non-called candidates.
- Recurrence remains deferred; seeded trainings/events are individual instances.
- RLS decision from VS01 is unchanged.
- No Notices or external delivery worker is introduced.
- No Logical Model v1 deviation was required.
