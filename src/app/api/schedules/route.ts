import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/db";
import { schedules } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth-server";
import { err, handleError, ok } from "@/lib/apiResponse";
import { preScheduledScheduleSchema, validate } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const body = validate(preScheduledScheduleSchema, await req.json());
    const now = new Date().toISOString();
    const [schedule] = await db
      .insert(schedules)
      .values({
        id: uuid(),
        memberId: session.userId,
        ...body,
        startDate: body.startDate ?? null,
        endDate: body.endDate ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return ok({
      schedule,
      message: "Your schedule has been added anonymously. We'll start looking for matches.",
    }, 201);
  } catch (error) {
    return handleError(error, "Schedules POST error");
  }
}

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const rows = await db
      .select()
      .from(schedules)
      .where(eq(schedules.memberId, session.userId))
      .orderBy(schedules.createdAt);

    return ok({ schedules: rows });
  } catch (error) {
    return handleError(error, "Schedules GET error");
  }
}
