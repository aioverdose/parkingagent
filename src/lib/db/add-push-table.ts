import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint text NOT NULL,
      auth text NOT NULL,
      p256dh text NOT NULL,
      user_agent text,
      created_at text NOT NULL
    );
    CREATE INDEX IF NOT EXISTS push_sub_user_idx ON push_subscriptions(user_id);
  `);
  console.log("Migration complete: added push_subscriptions table");
  await sql.end();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
