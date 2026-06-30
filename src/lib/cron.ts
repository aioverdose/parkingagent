import { db } from "@/lib/db";
import { parkingMatches, parkingMatchSchedules, pushSubscriptions, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { sendPushNotification } from "@/lib/push";

export async function sendDayOfReminders() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const confirmedMatches = await db
    .select()
    .from(parkingMatches)
    .where(
      and(
        eq(parkingMatches.status, "confirmed"),
        eq(parkingMatches.confirmed, true),
      ),
    );

  for (const match of confirmedMatches) {
    const [leavingSchedule] = await db
      .select()
      .from(parkingMatchSchedules)
      .where(eq(parkingMatchSchedules.id, match.leavingScheduleId))
      .limit(1);

    if (!leavingSchedule) continue;

    // 60 min before departure reminder
    if (leavingSchedule.leavingTime - nowMinutes === 60) {
      await sendReminder(match.leavingMemberId, "\uD83D\uDE97 Parking match today", `Today at ${formatMinutes(leavingSchedule.leavingTime)}.`);
    }

    // 15 min before departure reminder
    if (leavingSchedule.leavingTime - nowMinutes === 15) {
      await sendReminder(match.leavingMemberId, "\uD83C\uDFAF You're 15 min away", "The member waiting for your spot should be arriving soon.");
    }
  }
}

async function sendReminder(userId: string, title: string, body: string) {
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  for (const sub of subs) {
    await sendPushNotification(
      { endpoint: sub.endpoint, auth: sub.auth, p256dh: sub.p256dh },
      title,
      body,
      "/profile",
    );
  }
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
