import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courseModules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.isActive, true))
      .orderBy(courseModules.lastUpdated);

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
