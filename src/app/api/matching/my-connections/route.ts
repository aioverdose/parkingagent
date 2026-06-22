import { verifySession } from "@/lib/auth-server";
import { err, handleError, ok } from "@/lib/apiResponse";
import { preScheduledConnectionsForMember } from "@/lib/services/scheduleMatching";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) return err("Unauthorized", 401);

    const connections = await preScheduledConnectionsForMember(session.userId);
    return ok({ connections });
  } catch (error) {
    return handleError(error, "Pre-scheduled connections GET error");
  }
}
