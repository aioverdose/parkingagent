import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { phoneVerifications, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");

    const [verification] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.phone, cleanPhone),
          eq(phoneVerifications.verified, false),
        ),
      )
      .orderBy(desc(phoneVerifications.createdAt))
      .limit(1);

    if (!verification) {
      return NextResponse.json({ error: "No verification code found. Request a new code." }, { status: 400 });
    }

    if (new Date(verification.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Code expired. Request a new code." }, { status: 400 });
    }

    if (verification.code !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Mark as verified
    await db
      .update(phoneVerifications)
      .set({ verified: true })
      .where(eq(phoneVerifications.id, verification.id));

    // If userId is associated, mark phone as verified on user record
    if (verification.userId) {
      await db
        .update(users)
        .set({ phoneVerified: true, phone: cleanPhone })
        .where(eq(users.id, verification.userId));
    }

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully",
      phone: cleanPhone,
    });
  } catch (error) {
    console.error("Verify phone error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
