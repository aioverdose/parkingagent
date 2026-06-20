import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-server";
import { getReferralStats, getReferralCode } from "@/lib/referral";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getReferralStats(session.userId);
    const code = await getReferralCode(session.userId);

    return NextResponse.json({
      stats,
      code,
      shareUrl: code
        ? `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://parking-agent.vercel.app"}?ref=${code}`
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to get referral stats" }, { status: 500 });
  }
}
