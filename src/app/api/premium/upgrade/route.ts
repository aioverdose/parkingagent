import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";

export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const now = new Date();
    const premiumUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await db
      .update(users)
      .set({
        isPremium: true,
        premiumUntil,
        updatedAt: now.toISOString(),
      })
      .where(eq(users.id, currentUser.id));

    return NextResponse.json({
      success: true,
      message: "You're now a Premium member!",
      premiumUntil,
    });
  } catch (error) {
    console.error("Premium upgrade error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
