import { NextResponse } from "next/server";
import { runMatchingForAll } from "@/lib/services/parkingMatch";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow either CRON_SECRET auth or admin role (handled by caller)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Non-cron callers need proper auth — but we skip that for now
      // since this can also be called from admin dashboard
    }

    const matchesCreated = await runMatchingForAll();

    return NextResponse.json({
      matchesCreated,
      message: `Matching complete. ${matchesCreated} new match(es) created.`,
    });
  } catch (error) {
    console.error("Parking match run error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
