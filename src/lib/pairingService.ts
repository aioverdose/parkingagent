export interface User {
  id: string;
  name: string;
  email: string;
  rankingScore: number;
  isGoodStanding: boolean;
  isMember: boolean;
  latitude: number;
  longitude: number;
}

export interface SpotOffer {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: Date;
  status: "available" | "matched" | "completed" | "expired";
}

export interface Match {
  id: string;
  spotOfferId: string;
  departingUserId: string;
  arrivingUserId: string;
  status: "active" | "completed" | "cancelled" | "expired";
  matchedAt: Date;
  arrivalAt: Date | null;
  spotLatitude: number;
  spotLongitude: number;
}

const mockUsers: User[] = [
  {
    id: "u1",
    name: "Alice Johnson",
    email: "alice@example.com",
    rankingScore: 92,
    isGoodStanding: true,
    isMember: true,
    latitude: 33.7701,
    longitude: -118.1937,
  },
  {
    id: "u2",
    name: "Bob Smith",
    email: "bob@example.com",
    rankingScore: 78,
    isGoodStanding: true,
    isMember: true,
    latitude: 33.7715,
    longitude: -118.1945,
  },
  {
    id: "u3",
    name: "Carol Davis",
    email: "carol@example.com",
    rankingScore: 45,
    isGoodStanding: false,
    isMember: true,
    latitude: 33.769,
    longitude: -118.192,
  },
];

const mockSpotOffers: SpotOffer[] = [
  {
    id: "so1",
    userId: "u1",
    latitude: 33.7705,
    longitude: -118.193,
    address: "123 Pine Ave, Long Beach, CA",
    timestamp: new Date(),
    status: "available",
  },
  {
    id: "so2",
    userId: "u2",
    latitude: 33.771,
    longitude: -118.194,
    address: "456 Elm St, Long Beach, CA",
    timestamp: new Date(Date.now() - 60000),
    status: "available",
  },
];

const mockMatches: Match[] = [
  {
    id: "m1",
    spotOfferId: "so1",
    departingUserId: "u1",
    arrivingUserId: "u2",
    status: "active",
    matchedAt: new Date(),
    arrivalAt: null,
    spotLatitude: 33.7705,
    spotLongitude: -118.193,
  },
];

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findClosestGoodStandingMember(
  latitude: number,
  longitude: number,
  excludeUserId?: string
): User | null {
  const candidates = mockUsers.filter(
    (u) =>
      u.isGoodStanding &&
      u.isMember &&
      u.id !== excludeUserId
  );

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) =>
      haversineDistance(latitude, longitude, a.latitude, a.longitude) -
      haversineDistance(latitude, longitude, b.latitude, b.longitude)
  );

  return candidates[0];
}

export function createMatch(
  spotOffer: SpotOffer,
  arrivingUser: User
): Match {
  const match: Match = {
    id: `match-${Date.now()}`,
    spotOfferId: spotOffer.id,
    departingUserId: spotOffer.userId,
    arrivingUserId: arrivingUser.id,
    status: "active",
    matchedAt: new Date(),
    arrivalAt: null,
    spotLatitude: spotOffer.latitude,
    spotLongitude: spotOffer.longitude,
  };

  spotOffer.status = "matched";

  return match;
}

export function acceptMatch(match: Match): void {
  match.status = "completed";
  match.arrivalAt = new Date();
}

export function cancelMatch(match: Match): void {
  match.status = "cancelled";
}

export function expireMatch(match: Match): void {
  match.status = "expired";
}

export function getMockUsers(): User[] {
  return [...mockUsers];
}

export function getMockSpotOffers(): SpotOffer[] {
  return [...mockSpotOffers];
}

export function getMockMatches(): Match[] {
  return [...mockMatches];
}
