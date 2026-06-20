import { db } from "@/lib/db";
import { parkingBeacons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    const beacons = await db
      .select()
      .from(parkingBeacons)
      .where(eq(parkingBeacons.userId, currentUser.id))
      .orderBy(parkingBeacons.createdAt);

    return ok({ beacons });
  } catch (error) {
    return handleError(error, "My beacons error");
  }
}
