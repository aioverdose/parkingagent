import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { parkingBeacons, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { validate, beaconActivateSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(req, 10);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    if (currentUser.tier !== "premium" && !currentUser.isPremium) {
      return err("Premium subscription required", 403);
    }

    const { departureTime, latitude, longitude } = validate(beaconActivateSchema, await req.json());

    const beaconId = uuid();
    const now = new Date().toISOString();

    await db.insert(parkingBeacons).values({
      id: beaconId,
      userId: currentUser.id,
      departureTime,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: 5,
      status: "searching",
      createdAt: now,
    });

    return ok({
      success: true,
      beaconId,
      message: "Beacon sent! We're searching for incoming members in your area.",
      radius: 5,
    });
  } catch (error) {
    return handleError(error, "Beacon activate error");
  }
}
