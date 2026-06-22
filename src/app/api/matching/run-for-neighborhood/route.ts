import { activeScheduleNeighborhoods, createNovelPreScheduledMatches, findMatchesForNeighborhood } from "@/lib/services/scheduleMatching";
import { verifySession } from "@/lib/auth-server";
import { err, handleError, ok } from "@/lib/apiResponse";
import { runMatchingForNeighborhoodSchema, validate } from "@/lib/validation";

function isCronRequest(req: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!isCronRequest(req) && session?.role !== "admin") {
      return err("Unauthorized", 401);
    }

    const body = validate(runMatchingForNeighborhoodSchema, await req.json().catch(() => ({})));
    const neighborhoodIds = body.neighborhoodId ? [body.neighborhoodId] : await activeScheduleNeighborhoods();

    let matchesCreated = 0;
    for (const neighborhoodId of neighborhoodIds) {
      const potential = await findMatchesForNeighborhood(neighborhoodId);
      matchesCreated += await createNovelPreScheduledMatches(potential);
    }

    return ok({
      neighborhoodsChecked: neighborhoodIds.length,
      matchesCreated,
      message: `Matching complete. ${matchesCreated} new pre-scheduled connection(s) created.`,
    });
  } catch (error) {
    return handleError(error, "Run pre-scheduled matching error");
  }
}
