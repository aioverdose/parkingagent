import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { sendEmail } from "@/lib/email";
import { validate, forgotPasswordSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 3);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const { email } = validate(forgotPasswordSchema, await req.json());

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return ok({ ok: true });
    }

    const token = uuid();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
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
      "Reset your Spotimization password",
      `Click here to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    );

    return ok({ ok: true });
  } catch (error) {
    return handleError(error, "Forgot password error");
  }
}
