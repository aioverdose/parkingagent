import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cmsVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function POST() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .update(cmsVersions)
      .set({ status: "published" })
      .where(eq(cmsVersions.status, "draft"));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin CMS publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
