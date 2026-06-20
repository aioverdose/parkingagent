import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { spotOffers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude, address, expectedDeparture, vehicleType, vehicleSize } = await req.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 },
      );
    }

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

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Pairing offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offers = await db
      .select()
      .from(spotOffers)
      .where(eq(spotOffers.status, "available"));

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Pairing offers GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
