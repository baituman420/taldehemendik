export type AuthIdentity = { subject: string; email: string };

export interface AuthAdapter {
  requestOtp(email: string): Promise<{ challengeId: string; developmentOtp?: string }>;
  verifyOtp(email: string, challengeId: string, otp: string): Promise<AuthIdentity>;
  issueAccessToken(userId: string): string;
  verifyAccessToken(token: string): { userId: string };
}
