import { db } from "@/lib/db";
import { haversineDistanceMiles } from "@/lib/geo";
import { users, spotAnchors } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const LEVEL_MAP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 2000,
  7: 5000,
};

const LEVEL_TITLES: Record<number, string> = {
  1: "Rookie Scout",
  2: "Beginner Scout",
  3: "Junior Scout",
  4: "Experienced Scout",
  5: "Master Scout",
  6: "Legend Scout",
  7: "Top Scout",
};

export function getScoutLevelTitle(level: number): string {
  return LEVEL_TITLES[level] || "Rookie Scout";
}

export async function getScoutProfile(userId: string) {
  const [member] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!member) return null;

  const badges: string[] = JSON.parse(member.scoutBadges || "[]");

  return {
    id: member.id,
    name: member.name,
    anchorCount: member.anchorCount || 0,
    successfulMatches: member.successfulMatches || 0,
    failedMatches: member.failedMatches || 0,
    scoutLevel: member.scoutLevel || 1,
    scoutLevelTitle: getScoutLevelTitle(member.scoutLevel || 1),
    scoutPoints: member.scoutPoints || 0,
    scoutBadges: badges,
    ranking: member.ranking || 5,
    tier: member.tier || "free",
    isPremium: member.isPremium || false,
  };
}

export async function checkAnchorLimits(userId: string): Promise<string | null> {
  const [member] = await db
    .select({
      tier: users.tier,
      isPremium: users.isPremium,
      anchorCount: users.anchorCount,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!member) return "Member not found";

  const isPremium = member.tier === "premium" || member.isPremium === true;
  const dailyLimit = isPremium ? 10 : 5;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayAnchors = await db
    .select({ count: sql<number>`count(*)` })
    .from(spotAnchors)
    .where(
      and(
        eq(spotAnchors.scoutId, userId),
        gte(spotAnchors.createdAt, todayStart.toISOString()),
      ),
    );

  const count = Number(todayAnchors[0]?.count || 0);
  if (count >= dailyLimit) {
    return `Daily anchor limit reached (${dailyLimit}). Upgrade to Premium for more.`;
  }

  const [lastAnchor] = await db
    .select({ timestamp: spotAnchors.timestamp })
    .from(spotAnchors)
    .where(eq(spotAnchors.scoutId, userId))
    .orderBy(desc(spotAnchors.timestamp))
    .limit(1);

  if (lastAnchor) {
    const elapsed = Date.now() - lastAnchor.timestamp;
    const cooldown = 5 * 60 * 1000;
    if (elapsed < cooldown) {
      const remaining = Math.ceil((cooldown - elapsed) / 1000 / 60);
      return `Cooldown active. Wait ${remaining} minute(s) before anchoring again.`;
    }
  }

  return null;
}

export async function updateScoutPoints(userId: string, action: string): Promise<number> {
  const POINTS_MAP: Record<string, number> = {
    anchorSpot: 15,
    spotClaimed: 25,
    spotParkedSuccessfully: 50,
    spotNotParked: -10,
    fakeAnchor: -50,
  };

  let points = POINTS_MAP[action] || 0;

  const [member] = await db
    .select({ tier: users.tier, isPremium: users.isPremium, scoutPoints: users.scoutPoints })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (member && (member.tier === "premium" || member.isPremium === true) && points > 0) {
    points = Math.round(points * 1.1);
  }

  const newPoints = (member?.scoutPoints || 0) + points;
  await db
    .update(users)
    .set({ scoutPoints: newPoints, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  await updateScoutLevel(userId, newPoints);

  return newPoints;
}

export async function updateScoutLevel(userId: string, points: number): Promise<number> {
  let newLevel = 1;
  for (const [level, reqPoints] of Object.entries(LEVEL_MAP).reverse()) {
    if (points >= reqPoints) {
      newLevel = parseInt(level);
      break;
    }
  }

  await db
    .update(users)
    .set({ scoutLevel: newLevel, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  return newLevel;
}

export async function awardScoutBadge(userId: string, badge: string): Promise<string[]> {
  const [member] = await db
    .select({ scoutBadges: users.scoutBadges })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const badges: string[] = JSON.parse(member?.scoutBadges || "[]");
  if (!badges.includes(badge)) {
    badges.push(badge);
    await db
      .update(users)
      .set({ scoutBadges: JSON.stringify(badges), updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId));
  }

  return badges;
}

export async function createAnchor(
  userId: string,
  lat: number,
  lng: number,
  timestamp: number,
): Promise<any> {
  const limitError = await checkAnchorLimits(userId);
  if (limitError) throw new Error(limitError);

  const now = new Date().toISOString();
  const anchorId = uuid();

  const neighborhood = detectNeighborhood(lat, lng);

  const [member] = await db
    .select({ anchorCount: users.anchorCount })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const newAnchorCount = (member?.anchorCount || 0) + 1;

  await db.insert(spotAnchors).values({
    id: anchorId,
    scoutId: userId,
    latitude: lat,
    longitude: lng,
    neighborhood,
    timestamp,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(users)
    .set({ anchorCount: newAnchorCount, updatedAt: now })
    .where(eq(users.id, userId));

  await updateScoutPoints(userId, "anchorSpot");

  if (newAnchorCount === 1) await awardScoutBadge(userId, "First Anchor");
  if (newAnchorCount >= 10) await awardScoutBadge(userId, "Spot Hunter");

  // Search for nearby miners with active beacons / looking for spots
  const nearbyMiners = await findNearbyMiners(lat, lng);

  return { anchorId, neighborhood, nearbyMiners };
}

export async function claimAnchor(anchorId: string, minerId: string): Promise<any> {
  const [anchor] = await db
    .select()
    .from(spotAnchors)
    .where(eq(spotAnchors.id, anchorId))
    .limit(1);

  if (!anchor) throw new Error("Anchor not found");
  if (anchor.status !== "active") throw new Error("Anchor is no longer active");

  const now = new Date().toISOString();
  await db
    .update(spotAnchors)
    .set({ status: "claimed", minerId, updatedAt: now })
    .where(eq(spotAnchors.id, anchorId));

  await updateScoutPoints(anchor.scoutId, "spotClaimed");

  return { scoutId: anchor.scoutId };
}

export async function confirmParking(
  anchorId: string,
  success: boolean,
): Promise<any> {
  const [anchor] = await db
    .select()
    .from(spotAnchors)
    .where(eq(spotAnchors.id, anchorId))
    .limit(1);

  if (!anchor) throw new Error("Anchor not found");

  const now = new Date().toISOString();

  if (success) {
    await db
      .update(spotAnchors)
      .set({ status: "completed", updatedAt: now })
      .where(eq(spotAnchors.id, anchorId));

    await updateScoutPoints(anchor.scoutId, "spotParkedSuccessfully");

    const [scout] = await db
      .select({ successfulMatches: users.successfulMatches, ranking: users.ranking })
      .from(users)
      .where(eq(users.id, anchor.scoutId))
      .limit(1);

    const newSuccessCount = (scout?.successfulMatches || 0) + 1;
    const newRanking = Math.min(5, (scout?.ranking || 5) + 1);

    await db
      .update(users)
      .set({
        successfulMatches: newSuccessCount,
        ranking: newRanking,
        updatedAt: now,
      })
      .where(eq(users.id, anchor.scoutId));

    if (newSuccessCount >= 20) await awardScoutBadge(anchor.scoutId, "Gold Scout");
    if (newSuccessCount >= 50) await awardScoutBadge(anchor.scoutId, "Community Hero");

    // Award miner points
    if (anchor.minerId) {
      const [miner] = await db
        .select({ matchCount: users.matchCount })
        .from(users)
        .where(eq(users.id, anchor.minerId))
        .limit(1);
      await db
        .update(users)
        .set({ matchCount: (miner?.matchCount || 0) + 1, updatedAt: now })
        .where(eq(users.id, anchor.minerId));
    }
  } else {
    await db
      .update(spotAnchors)
      .set({ status: "failed", updatedAt: now })
      .where(eq(spotAnchors.id, anchorId));

    await updateScoutPoints(anchor.scoutId, "spotNotParked");

    const [scout] = await db
      .select({ failedMatches: users.failedMatches })
      .from(users)
      .where(eq(users.id, anchor.scoutId))
      .limit(1);

    await db
      .update(users)
      .set({ failedMatches: (scout?.failedMatches || 0) + 1, updatedAt: now })
      .where(eq(users.id, anchor.scoutId));
  }

  return { success };
}

export async function getLeaderboard(limit = 10) {
  const scouts = await db
    .select({
      id: users.id,
      name: users.name,
      scoutLevel: users.scoutLevel,
      scoutPoints: users.scoutPoints,
      ranking: users.ranking,
      successfulMatches: users.successfulMatches,
      tier: users.tier,
    })
    .from(users)
    .orderBy(desc(users.scoutPoints))
    .limit(limit);

  return scouts.map((s) => ({
    ...s,
    scoutLevelTitle: getScoutLevelTitle(s.scoutLevel),
    scoutId: `Scout #${s.id.slice(0, 4).toUpperCase()}`,
  }));
}

export async function getAnchorsForUser(userId: string) {
  return db
    .select()
    .from(spotAnchors)
    .where(eq(spotAnchors.scoutId, userId))
    .orderBy(desc(spotAnchors.createdAt));
}

async function findNearbyMiners(lat: number, lng: number) {
  const allUsers = await db
    .select({ id: users.id, latitude: users.latitude, longitude: users.longitude, ranking: users.ranking })
    .from(users)
    .where(and(eq(users.isMember, true), eq(users.status, "good-standing")));

  const blockSizeMiles = 0.1;
  const maxDistance = 5 * blockSizeMiles;

  return allUsers
    .filter((u) => u.latitude && u.longitude)
    .filter((u) => {
      const dist = haversineDistanceMiles(lat, lng, u.latitude!, u.longitude!);
      return dist <= maxDistance && u.id;
    })
    .sort((a, b) => (b.ranking || 5) - (a.ranking || 5))
    .slice(0, 10);
}

function detectNeighborhood(lat: number, lng: number): string {
  if (lat >= 33.76 && lat <= 33.78 && lng >= -118.20 && lng <= -118.18) return "Belmont Shore";
  if (lat >= 33.77 && lat <= 33.79 && lng >= -118.19 && lng <= -118.17) return "Downtown Long Beach";
  if (lat >= 33.78 && lat <= 33.80 && lng >= -118.18 && lng <= -118.16) return "Naples";
  return "Long Beach";
}
