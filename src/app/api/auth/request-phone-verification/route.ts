import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { phoneVerifications } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { phone, userId } = await req.json();
    if (!phone || !/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const id = uuid();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();
    const cleanPhone = phone.replace(/\D/g, "");

    // Invalidate any previous unverified codes for this phone
    await db
      .update(phoneVerifications)
      .set({ verified: true })
      .where(
        and(
          eq(phoneVerifications.phone, cleanPhone),
          eq(phoneVerifications.verified, false),
        ),
      );

    await db.insert(phoneVerifications).values({
      id,
      phone: cleanPhone,
      code,
      userId: userId || null,
      verified: false,
      expiresAt,
      createdAt,
    });

    // In dev mode, return the code for convenience
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json({
      success: true,
      message: isDev ? `Verification code sent to ${phone}` : `Verification code sent to ${phone}`,
      ...(isDev && { devCode: code }),
    });
  } catch (error) {
    console.error("Request phone verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
