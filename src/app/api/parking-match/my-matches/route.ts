import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth-server";
import { getMatchesForMember } from "@/lib/services/parkingMatch";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matches = await getMatchesForMember(session.userId);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Parking matches GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
