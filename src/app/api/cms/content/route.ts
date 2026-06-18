import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cmsContent } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const key = searchParams.get("key");

    let query = db.select().from(cmsContent);

    if (page) {
      query = query.where(eq(cmsContent.page, page)) as typeof query;
    }
    if (key) {
      query = query.where(
        and(eq(cmsContent.page, page ?? ""), eq(cmsContent.key, key)),
      ) as typeof query;
    }

    const entries = await query;

    // Transform into a structured object
    const grouped: Record<string, Record<string, string>> = {};
    for (const entry of entries) {
      if (!grouped[entry.page]) grouped[entry.page] = {};
      grouped[entry.page][entry.key] = entry.value;
    }

    return NextResponse.json({ content: grouped, entries });
  } catch (error) {
    console.error("CMS content error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
