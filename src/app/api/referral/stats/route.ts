import { verifySession } from "@/lib/auth-server";
import { getReferralStats, getReferralCode } from "@/lib/referral";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const stats = await getReferralStats(session.userId);
    const code = await getReferralCode(session.userId);

    return ok({
      stats,
      code,
      shareUrl: code
        ? `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${code}`
        : null,
    });
  } catch {
    return err("Failed to get referral stats", 500);
  }
}
