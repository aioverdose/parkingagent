import { db } from "@/lib/db";
import { cmsContent, cmsVersions, courseModules } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
    }

    const entries = await db.select().from(cmsContent);
    const versions = await db.select().from(cmsVersions).orderBy(cmsVersions.lastUpdated);
    const modules = await db.select().from(courseModules);

    const grouped: Record<string, Record<string, string>> = {};
    for (const entry of entries) {
      if (!grouped[entry.page]) grouped[entry.page] = {};
      grouped[entry.page][entry.key] = entry.value;
    }

    return ok({ content: grouped, versions, modules });
  } catch (error) {
    return handleError(error, "Admin CMS GET error");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
    }

    const { page, key, value } = await req.json();

    if (!page || !key || value === undefined) {
      return err("page, key, and value are required", 400);
    }

    const now = new Date().toISOString().split("T")[0];

    const [existing] = await db
      .select()
      .from(cmsContent)
      .where(and(eq(cmsContent.page, page), eq(cmsContent.key, key)))
      .limit(1);

    if (existing) {
      await db
        .update(cmsContent)
        .set({ value, updatedAt: now })
        .where(eq(cmsContent.id, existing.id));
    } else {
      await db.insert(cmsContent).values({
        id: uuid(),
        page,
        key,
        value,
        updatedAt: now,
      });
    }

    return ok({ success: true });
  } catch (error) {
    return handleError(error, "Admin CMS PUT error");
  }
}
