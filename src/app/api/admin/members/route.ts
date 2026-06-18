import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const membershipType = searchParams.get("membershipType");
    const search = searchParams.get("search");

    let allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isMember: users.isMember,
        isAdmin: users.isAdmin,
        rankingScore: users.rankingScore,
        status: users.status,
        membershipType: users.membershipType,
        completedCourses: users.completedCourses,
        joinedDate: users.joinedDate,
      })
      .from(users)
      .orderBy(users.joinedDate);

    if (status && status !== "all") {
      allUsers = allUsers.filter((u) => u.status === status);
    }
    if (membershipType && membershipType !== "all") {
      allUsers = allUsers.filter((u) => u.membershipType === membershipType);
    }
    if (search) {
      const q = search.toLowerCase();
      allUsers = allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }

    return NextResponse.json({ members: allUsers });
  } catch (error) {
    console.error("Admin members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
