import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const raw = await db.query.matches.findMany({
      with: {
        departingUser: {
          columns: { name: true, email: true },
        },
        arrivingUser: {
          columns: { name: true, email: true },
        },
      },
      orderBy: (matches, { desc }) => [desc(matches.matchedAt)],
    });

    let result = raw.map((m) => ({
      id: m.id,
      status: m.status,
      matchedAt: m.matchedAt,
      arrivalAt: m.arrivalAt,
      spotAddress: `${m.spotLatitude?.toFixed(4)}, ${m.spotLongitude?.toFixed(4)}`,
      arrivingMemberName: m.arrivingUser.name,
      arrivingMemberEmail: m.arrivingUser.email,
      departingMemberName: m.departingUser.name,
      departingMemberEmail: m.departingUser.email,
    }));

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }

    return NextResponse.json({ matches: result });
  } catch (error) {
    console.error("Admin matches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
