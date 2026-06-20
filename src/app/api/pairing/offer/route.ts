import { db } from "@/lib/db";
import { spotOffers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { validate, pairingOfferSchema } from "@/lib/validation";
import { rateLimit, rateLimitedResponse } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(req, 20);
    if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const { latitude, longitude, address, expectedDeparture, vehicleType, vehicleSize } = validate(pairingOfferSchema, await req.json());

    const offer: typeof spotOffers.$inferInsert = {
      id: uuid(),
      userId: session.userId,
      latitude,
      longitude,
      address: address ?? "",
      status: "available",
      createdAt: new Date().toISOString(),
      expectedDeparture: expectedDeparture ?? null,
      vehicleType: vehicleType ?? null,
      vehicleSize: vehicleSize ?? null,
    };

    await db.insert(spotOffers).values(offer);

    return ok({ offer });
  } catch (error) {
    return handleError(error, "Pairing offer error");
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return err("Unauthorized", 401);
    }

    const offers = await db
      .select()
      .from(spotOffers)
      .where(eq(spotOffers.status, "available"));

    return ok({ offers });
  } catch (error) {
    return handleError(error, "Pairing offers GET error");
  }
}
