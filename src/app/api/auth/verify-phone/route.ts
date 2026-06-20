import { db } from "@/lib/db";
import { phoneVerifications, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { validate, verifyPhoneSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 5);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const { phone, code } = validate(verifyPhoneSchema, await req.json());

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
      return err("No verification code found. Request a new code.", 400);
    }

    if (new Date(verification.expiresAt) < new Date()) {
      return err("Code expired. Request a new code.", 400);
    }

    if (verification.code !== code) {
      return err("Invalid code", 400);
    }

    await db
      .update(phoneVerifications)
      .set({ verified: true })
      .where(eq(phoneVerifications.id, verification.id));

    if (verification.userId) {
      await db
        .update(users)
        .set({ phoneVerified: true, phone: cleanPhone })
        .where(eq(users.id, verification.userId));
    }

    return ok({
      success: true,
      message: "Phone verified successfully",
      phone: cleanPhone,
    });
  } catch (error) {
    return handleError(error, "Verify phone error");
  }
}
