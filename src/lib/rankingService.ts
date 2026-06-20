import { db } from "@/lib/db";
import { users, parkingMatches } from "@/lib/db/schema";
import { eq, and, or, count } from "drizzle-orm";

export async function updateRanking(userId: string): Promise<number> {
  const [member] = await db
    .select({
      noShowCount: users.noShowCount,
      cancelCount: users.cancelCount,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!member) return 5;

  let newRanking = 5;
  if (member.noShowCount > 0) newRanking -= 1;
  if (member.cancelCount > 2) newRanking -= 1;
  if (member.noShowCount > 2 || member.cancelCount > 5) newRanking = 1;
  newRanking = Math.max(1, Math.min(5, newRanking));

  await db
    .update(users)
    .set({ ranking: newRanking, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  return newRanking;
}

export async function incrementNoShow(userId: string): Promise<number> {
  const [member] = await db
    .select({ noShowCount: users.noShowCount })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const newCount = (member?.noShowCount || 0) + 1;
  await db
    .update(users)
    .set({ noShowCount: newCount, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  return updateRanking(userId);
}

export async function incrementCancel(userId: string): Promise<number> {
  const [member] = await db
    .select({ cancelCount: users.cancelCount })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const newCount = (member?.cancelCount || 0) + 1;
  await db
    .update(users)
    .set({ cancelCount: newCount, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  return updateRanking(userId);
}

export async function incrementMatchCount(userId: string): Promise<void> {
  const [member] = await db
    .select({ matchCount: users.matchCount })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  await db
    .update(users)
    .set({
      matchCount: (member?.matchCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId));
}
