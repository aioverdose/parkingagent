import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { claimAnchor } from "@/lib/scoutService";
import { validate, scoutClaimSchema } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    const { anchorId } = validate(scoutClaimSchema, await req.json());

    const result = await claimAnchor(anchorId, currentUser.id);

    return ok({
      success: true,
      message: "Spot claimed! Please park and confirm.",
      ...result,
    });
  } catch (error) {
    return handleError(error, "Claim error");
  }
}
