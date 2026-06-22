import { db } from "@/lib/db";
import { phoneVerifications } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";
import { validate, requestPhoneVerificationSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, handleError } from "@/lib/apiResponse";
import twilio from "twilio";

function sendSms(phone: string, code: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return Promise.resolve(false);
  }

  const client = twilio(accountSid, authToken);
  return client.messages
    .create({
      body: `Your Spotimization verification code is: ${code}`,
      to: phone,
      from: fromNumber,
    })
    .then(() => true)
    .catch(() => false);
}

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 3);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const { phone, userId } = validate(requestPhoneVerificationSchema, await req.json());

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const id = uuid();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();
    const cleanPhone = phone.replace(/\D/g, "");

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

    const sent = await sendSms(cleanPhone, code);

    if (!sent) {
      const isDev = process.env.NODE_ENV === "development";
      return ok({
        success: true,
        message: "Verification code generated",
        code,
        dev: true,
      });
    }

    return ok({
      success: true,
      message: `Verification code sent to ${phone}`,
    });
  } catch (error) {
    return handleError(error, "Request phone verification error");
  }
}
