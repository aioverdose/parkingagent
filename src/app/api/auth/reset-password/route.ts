import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    if (new Date(resetToken.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await db.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, resetToken.userId));
    await db.update(passwordResetTokens).set({ usedAt: now }).where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
