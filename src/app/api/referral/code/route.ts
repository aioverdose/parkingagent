import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-server";
import { getReferralCode, generateReferralCode } from "@/lib/referral";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let code = await getReferralCode(session.userId);
    if (!code) {
      code = await generateReferralCode(session.userId);
    }

    return NextResponse.json({
      code,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://parking-agent.vercel.app"}?ref=${code}`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to get referral code" }, { status: 500 });
  }
}
