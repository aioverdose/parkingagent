import { db } from "@/lib/db";
import { courseModules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.isActive, true))
      .orderBy(courseModules.lastUpdated);

    return ok({ modules });
  } catch (error) {
    return handleError(error, "Courses error");
  }
}
