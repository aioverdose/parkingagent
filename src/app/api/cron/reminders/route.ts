import { verifySession } from "@/lib/auth-server";
import { sendDayOfReminders } from "@/lib/cron";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
    }

    await sendDayOfReminders();

    return ok({ sent: true });
  } catch (error) {
    return handleError(error, "Cron reminders error");
  }
}
