import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { validate, resetPasswordSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 5);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const { token, password } = validate(resetPasswordSchema, await req.json());

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
      return err("Invalid or expired reset token", 400);
    }

    if (new Date(resetToken.expiresAt) < new Date()) {
      return err("Reset token has expired", 400);
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await db.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, resetToken.userId));
    await db.update(passwordResetTokens).set({ usedAt: now }).where(eq(passwordResetTokens.id, resetToken.id));

    return ok({ ok: true });
  } catch (error) {
    return handleError(error, "Reset password error");
  }
}
