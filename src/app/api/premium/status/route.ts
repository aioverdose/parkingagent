import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ premium: false }, { status: 200 });
    }

    const isPremiumValid = user.isPremium && user.premiumUntil
      ? new Date(user.premiumUntil) > new Date()
      : false;

    return NextResponse.json({
      premium: isPremiumValid,
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
