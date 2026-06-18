import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  await sql.unsafe(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS stripe_customer_id text,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
    ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS subscription_period_end text;
  `);
  console.log("Migration complete: added Stripe columns to users table");
  await sql.end();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
