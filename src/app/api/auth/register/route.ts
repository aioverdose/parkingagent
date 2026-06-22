import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, emailVerifications, courseModules, userCourseCompletions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { validate, registerSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { lookupReferrerByCode, createReferral, generateReferralCode, REFERRAL_COOKIE } from "@/lib/referral";
import { getTierForSignup, getBadges } from "@/lib/earlyAdopter";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 5);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const { name, email, password, phone, completedModuleIds } = validate(registerSchema, await req.json());

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return err("Email already registered", 409);
    }

    // Count existing members to assign signup number
    const allUsers = await db.select({ id: users.id }).from(users);
    const signupNumber = allUsers.length + 1;
    const tier = getTierForSignup(signupNumber);

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const userId = `member-${Date.now()}`;

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
      email,
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
      tier,
      signupNumber,
      scoutBadges: JSON.stringify(getBadges(signupNumber)),
    });

    await generateReferralCode(userId);

    const verificationToken = uuid();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await db.insert(emailVerifications).values({
      id: uuid(),
      email,
      token: verificationToken,
      userId,
      verified: false,
      expiresAt: verificationExpiresAt,
      createdAt: now,
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

    await sendEmail(
      email,
      "Verify your email — Spotimization",
      `Hi ${name},\n\nWelcome to Spotimization! Please verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— Spotimization`,
    );

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
      email,
      "member",
    );

    await setSessionCookie(token, expiresAt);

    return ok({
      user: {
        id: userId,
        name,
        email,
        role: "member",
        isMember: !!allRequiredComplete,
        isAdmin: false,
        tier,
        signupNumber,
        earlyAdopter: tier === "free_1year",
      },
    });
  } catch (error) {
    return handleError(error, "Register error");
  }
}
