import { db } from "@/lib/db";
import { emailVerifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return err("Missing verification token", 400);
    }

    const [verification] = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token))
      .limit(1);

    if (!verification) {
      return err("Invalid or expired verification link", 404);
    }

    if (verification.verified) {
      return ok({ message: "Email already verified" });
    }

    if (new Date(verification.expiresAt) < new Date()) {
      return err("Verification link has expired", 410);
    }

    await db
      .update(emailVerifications)
      .set({ verified: true })
      .where(eq(emailVerifications.token, token));

    return ok({ message: "Email verified successfully" });
  } catch (error) {
    return handleError(error, "Verify email error");
  }
}
