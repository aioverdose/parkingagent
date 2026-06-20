import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { validate, loginSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { isEarlyAdopter } from "@/lib/earlyAdopter";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 10);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const { email, password } = validate(loginSchema, await req.json());

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return err("Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return err("Invalid email or password", 401);
    }

    const { token, expiresAt } = await createSession(
      user.id,
      user.email,
      user.role as "admin" | "member",
    );

    await setSessionCookie(token, expiresAt);

    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isMember: user.isMember,
        isAdmin: user.isAdmin,
        tier: user.tier,
        signupNumber: user.signupNumber ?? undefined,
        earlyAdopter: user.signupNumber ? isEarlyAdopter(user.signupNumber) : undefined,
      },
    });
  } catch (error) {
    return handleError(error, "Login error");
  }
}
