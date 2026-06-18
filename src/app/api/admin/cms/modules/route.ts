import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courseModules } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const modules = await db.select().from(courseModules);
    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Admin modules GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, required } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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
    return NextResponse.json({ module: mod });
  } catch (error) {
    console.error("Admin modules POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
