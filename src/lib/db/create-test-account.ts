import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function createTestAccount() {
  const passwordHash = await bcrypt.hash("test123", 10);
  const now = new Date().toISOString();

  await db.insert(users).values({
    id: "test-user-001",
    name: "Test User",
    email: "test@spotimization.com",
    passwordHash,
    role: "member",
    isMember: true,
    isAdmin: false,
    rankingScore: 100,
    status: "good-standing",
    membershipType: "annual",
    completedCourses: true,
    latitude: 33.7701,
    longitude: -118.1937,
    joinedDate: now.split("T")[0],
    createdAt: now,
  }).onConflictDoNothing();

  console.log("Test account created: test@spotimization.com / test123");
}

createTestAccount().catch((e) => {
  console.error(e);
  process.exit(1);
});
