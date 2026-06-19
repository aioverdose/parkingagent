import "dotenv/config";
import { db } from "./index";

async function addPasswordResetTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS password_reset_token_idx
    ON password_reset_tokens(token);
  `);

  console.log("password_reset_tokens table ready");
}

addPasswordResetTable().catch((e) => {
  console.error(e);
  process.exit(1);
});
