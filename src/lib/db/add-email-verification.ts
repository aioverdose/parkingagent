import "dotenv/config";
import { db } from "./index";

async function addEmailVerification() {
  await db.execute(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      verified boolean NOT NULL DEFAULT false,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS ev_token_idx
    ON email_verifications(token);
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS ev_email_idx
    ON email_verifications(email);
  `);

  console.log("email_verifications table ready");
}

addEmailVerification().catch((e) => {
  console.error(e);
  process.exit(1);
});
