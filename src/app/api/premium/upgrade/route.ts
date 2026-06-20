import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    const now = new Date();
    const premiumUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await db
      .update(users)
      .set({
        tier: "premium",
        isPremium: true,
        premiumUntil,
        updatedAt: now.toISOString(),
      })
      .where(eq(users.id, currentUser.id));

    return ok({
      success: true,
      message: "You're now a Premium member!",
      premiumUntil,
    });
  } catch (error) {
    return handleError(error, "Premium upgrade error");
  }
}
