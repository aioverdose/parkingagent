import { db } from "@/lib/db";
import { cmsVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
    }

    await db
      .update(cmsVersions)
      .set({ status: "published" })
      .where(eq(cmsVersions.status, "draft"));

    return ok({ success: true });
  } catch (error) {
    return handleError(error, "Admin CMS publish error");
  }
}
