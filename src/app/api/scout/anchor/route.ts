import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { createAnchor } from "@/lib/scoutService";
import { validate, scoutAnchorSchema } from "@/lib/validation";
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

    const { lat, lng } = validate(scoutAnchorSchema, await req.json());

    const result = await createAnchor(currentUser.id, Number(lat), Number(lng), Date.now());

    return ok({
      success: true,
      message: "Spot anchored! System is searching for miners...",
      anchorId: result.anchorId,
      neighborhood: result.neighborhood,
      nearbyMiners: result.nearbyMiners?.length || 0,
    });
  } catch (error) {
    return handleError(error, "Anchor error");
  }
}
