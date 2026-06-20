import { verifySession } from "@/lib/auth-server";
import { getMatchesForMember } from "@/lib/services/parkingMatch";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const matches = await getMatchesForMember(session.userId);

    return ok({ matches });
  } catch (error) {
    return handleError(error, "Parking matches GET error");
  }
}
