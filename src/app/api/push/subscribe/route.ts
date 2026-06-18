import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint, auth, p256dh, userAgent } = await req.json();

    if (!endpoint || !auth || !p256dh) {
      return NextResponse.json({ error: "Missing subscription details" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, session.userId),
          eq(pushSubscriptions.endpoint, endpoint),
        ),
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ ok: true });
    }

    await db.insert(pushSubscriptions).values({
      id: uuid(),
      userId: session.userId,
      endpoint,
      auth,
      p256dh,
      userAgent: userAgent ?? null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
