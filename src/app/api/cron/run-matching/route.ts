import { activeScheduleNeighborhoods, createNovelPreScheduledMatches, findMatchesForNeighborhood } from "@/lib/services/scheduleMatching";
import { err, handleError, ok } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
      return err("Unauthorized", 401);
    }

    const neighborhoodIds = await activeScheduleNeighborhoods();
    let matchesCreated = 0;

    for (const neighborhoodId of neighborhoodIds) {
      const potential = await findMatchesForNeighborhood(neighborhoodId);
      matchesCreated += await createNovelPreScheduledMatches(potential);
    }

    return ok({ neighborhoodsChecked: neighborhoodIds.length, matchesCreated });
  } catch (error) {
    return handleError(error, "Cron pre-scheduled matching error");
  }
}
