import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !["good-standing", "suspended", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set({
        status,
        isMember: status === "good-standing",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        status: users.status,
        rankingScore: users.rankingScore,
        membershipType: users.membershipType,
        completedCourses: users.completedCourses,
        joinedDate: users.joinedDate,
      });

    if (!updated) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error("Admin member update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
