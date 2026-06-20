import { db } from "@/lib/db";
import { courseModules } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
    }

    const modules = await db.select().from(courseModules);
    return ok({ modules });
  } catch (error) {
    return handleError(error, "Admin modules GET error");
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
    }

    const { title, description, required } = await req.json();

    if (!title) {
      return err("Title is required", 400);
    }

    const mod = {
      id: uuid(),
      title,
      description: description ?? "",
      isActive: true,
      required: required ?? true,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    await db.insert(courseModules).values(mod);
    return ok({ module: mod });
  } catch (error) {
    return handleError(error, "Admin modules POST error");
  }
}
