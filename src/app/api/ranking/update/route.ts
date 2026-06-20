import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { updateRanking, incrementNoShow, incrementCancel } from "@/lib/rankingService";
import { validate, rankingUpdateSchema } from "@/lib/validation";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return err("Not authenticated", 401);
    }

    const { action, targetUserId } = validate(rankingUpdateSchema, await req.json());

    const userId = targetUserId || currentUser.id;

    let ranking: number;
    if (action === "no-show") {
      ranking = await incrementNoShow(userId);
    } else if (action === "cancel") {
      ranking = await incrementCancel(userId);
    } else {
      ranking = await updateRanking(userId);
    }

    return ok({ success: true, ranking });
  } catch (error) {
    return handleError(error, "Ranking update error");
  }
}
