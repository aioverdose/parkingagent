import { getCurrentUser } from "@/lib/auth-server";
import { getScoutProfile, getAnchorsForUser } from "@/lib/scoutService";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    const profile = await getScoutProfile(currentUser.id);
    const anchors = await getAnchorsForUser(currentUser.id);

    return ok({ profile, anchors });
  } catch (error) {
    return handleError(error, "Scout profile error");
  }
}
