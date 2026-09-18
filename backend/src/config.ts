export const config = {
  databaseUrl: process.env.DATABASE_URL ?? "postgres://talde:talde_dev_only@127.0.0.1:55433/taldehemendik",
  port: Number(process.env.PORT ?? 3100),
  exposeOtp: process.env.DEV_AUTH_EXPOSE_OTP === "true",
  authSecret: process.env.DEV_AUTH_TOKEN_SECRET ?? "development-only-secret-change-before-shared-use"
};
