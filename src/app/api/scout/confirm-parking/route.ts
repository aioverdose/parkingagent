import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { confirmParking } from "@/lib/scoutService";
import { validate, scoutConfirmParkingSchema } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    const { anchorId, success } = validate(scoutConfirmParkingSchema, await req.json());

    const result = await confirmParking(anchorId, Boolean(success));

    return ok({
      success: true,
      message: result.success ? "Parking confirmed! Scout rewarded." : "Parking marked as failed.",
    });
  } catch (error) {
    return handleError(error, "Confirm parking error");
  }
}
