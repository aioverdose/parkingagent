import { verifySession } from "@/lib/auth-server";
import { getReferralCode, generateReferralCode } from "@/lib/referral";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    let code = await getReferralCode(session.userId);
    if (!code) {
      code = await generateReferralCode(session.userId);
    }

    return ok({
      code,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${code}`,
    });
  } catch {
    return err("Failed to get referral code", 500);
  }
}
