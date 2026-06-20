import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, courseModules, userCourseCompletions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { lookupReferrerByCode, createReferral, generateReferralCode, REFERRAL_COOKIE } from "@/lib/referral";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, completedModuleIds } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const emailLower = email.toLowerCase();

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const userId = `member-${Date.now()}`;

    // Check if all required modules are completed
    const allModules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.required, true));

    const allRequiredComplete =
      completedModuleIds &&
      allModules.every((m) => completedModuleIds.includes(m.id));

    await db.insert(users).values({
      id: userId,
      name,
      email: emailLower,
      passwordHash,
      role: "member",
      isMember: !!allRequiredComplete,
      isAdmin: false,
      rankingScore: 0,
      status: allRequiredComplete ? "good-standing" : "pending",
      membershipType: "none",
      completedCourses: !!allRequiredComplete,
      phone: phone || null,
      phoneVerified: !!phone,
      joinedDate: today,
      createdAt: now,
    });

    // Generate referral code for new user
    await generateReferralCode(userId);

    // Check for referral cookie
    try {
      const cookieStore = await cookies();
      const refCode = cookieStore.get(REFERRAL_COOKIE)?.value;
      if (refCode) {
        const referrerId = await lookupReferrerByCode(refCode);
        if (referrerId && referrerId !== userId) {
          await createReferral(referrerId, userId, refCode);
        }
      }
    } catch {
      // cookie access may fail in some environments — non-critical
    }

    // Record course completions
    if (completedModuleIds && completedModuleIds.length > 0) {
      for (const moduleId of completedModuleIds) {
        await db.insert(userCourseCompletions).values({
          id: uuid(),
          userId,
          moduleId,
          completedAt: now,
        });
      }
    }

    const { token, expiresAt } = await createSession(
      userId,
      emailLower,
      "member",
    );

    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      user: {
        id: userId,
        name,
        email: emailLower,
        role: "member",
        isMember: !!allRequiredComplete,
        isAdmin: false,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
