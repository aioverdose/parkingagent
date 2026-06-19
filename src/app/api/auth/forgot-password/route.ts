import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = uuid();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    const now = new Date().toISOString();

    await db.insert(passwordResetTokens).values({
      id: uuid(),
      userId: user.id,
      token,
      expiresAt,
      usedAt: null,
      createdAt: now,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await sendEmail(
      user.email,
      "Reset your Parking Agent password",
      `Click here to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
