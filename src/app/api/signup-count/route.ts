import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ok, handleError } from "@/lib/apiResponse";
import { FIRST_100_CAP } from "@/lib/earlyAdopter";

export async function GET() {
  try {
    const result = await db.select({ count: users.id }).from(users);
    const count = result.length;
    return ok({ count, remaining: Math.max(0, FIRST_100_CAP - count), isFull: count >= FIRST_100_CAP });
  } catch (error) {
    return handleError(error, "Signup count error");
  }
}
