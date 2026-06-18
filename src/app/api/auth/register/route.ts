import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, courseModules, userCourseCompletions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const { name, email, password, completedModuleIds } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const emailLower = email.toLowerCase();

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const userId = `member-${Date.now()}`;

    // Check if all required modules are completed
    const allModules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.required, true));

    const allRequiredComplete =
      completedModuleIds &&
      allModules.every((m) => completedModuleIds.includes(m.id));

    await db.insert(users).values({
      id: userId,
      name,
      email: emailLower,
      passwordHash,
      role: "member",
      isMember: !!allRequiredComplete,
      isAdmin: false,
      rankingScore: 0,
      status: allRequiredComplete ? "good-standing" : "pending",
      membershipType: "none",
      completedCourses: !!allRequiredComplete,
      joinedDate: today,
      createdAt: now,
    });

    // Record course completions
    if (completedModuleIds && completedModuleIds.length > 0) {
      for (const moduleId of completedModuleIds) {
        await db.insert(userCourseCompletions).values({
          id: uuid(),
          userId,
          moduleId,
          completedAt: now,
        });
      }
    }

    const { token, expiresAt } = await createSession(
      userId,
      emailLower,
      "member",
    );

    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      user: {
        id: userId,
        name,
        email: emailLower,
        role: "member",
        isMember: !!allRequiredComplete,
        isAdmin: false,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
