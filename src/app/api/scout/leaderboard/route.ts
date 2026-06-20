import { getLeaderboard } from "@/lib/scoutService";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const leaderboard = await getLeaderboard(10);
    return ok({ leaderboard });
  } catch (error) {
    return handleError(error, "Leaderboard error");
  }
}
