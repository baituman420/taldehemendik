export type ErrorCode =
  | "AUTH_INVALID"
  | "INVITATION_INVALID"
  | "INVITATION_EXPIRED"
  | "LINK_REQUEST_ALREADY_EXISTS"
  | "GUARDIAN_LINK_REQUIRED"
  | "MEMBERSHIP_REQUIRED"
  | "PLAYER_NOT_ACCESSIBLE"
  | "AVAILABILITY_CLOSED"
  | "AVAILABILITY_VERSION_CONFLICT"
  | "PLAYER_NOT_IN_TEAMSEASON"
  | "ROLE_NOT_ALLOWED"
  | "IDEMPOTENCY_CONFLICT";

export class DomainError extends Error {
  constructor(public readonly code: ErrorCode, public readonly statusCode: number, message: string) {
    super(message);
  }
}
