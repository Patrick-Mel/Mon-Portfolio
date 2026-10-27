import "server-only";

/** Secrets serveur : ne jamais importer ce module depuis un composant client. */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  ownerNotificationEmail: process.env.OWNER_NOTIFICATION_EMAIL ?? "",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "",
  hashSalt: process.env.HASH_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-salt",
};
