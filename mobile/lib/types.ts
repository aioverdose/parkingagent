export interface User {
  id: string;
  name: string;
  email: string;
  role: "member" | "admin";
  isMember: boolean;
  vehicleType?: string;
  vehicleSize?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  licensePlate?: string;
  phone?: string;
  phoneVerified: boolean;
  rankingScore: number;
  isPremium: boolean;
  tier: "free" | "premium";
  scoutLevel: number;
  scoutPoints: number;
  neighborhood?: string;
  signupNumber: number;
}

export interface SpotOffer {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: "available" | "matched" | "completed" | "expired";
  expectedDeparture?: string;
  vehicleType?: string;
  vehicleSize?: string;
}

export interface ScoredOffer extends SpotOffer {
  distanceKm: number;
  rankingScore: number;
  compositeScore: number;
  etaMinutes?: number;
  etaDistance?: number;
  timeFitScore: number;
}

export interface Match {
  id: string;
  spotOfferId: string;
  departingUserId: string;
  arrivingUserId: string;
  departingUser?: { name: string; rankingScore: number; vehicleType?: string; licensePlate?: string };
  arrivingUser?: { name: string; rankingScore: number };
  status: "active" | "matched" | "arrived" | "completed" | "cancelled" | "expired";
  matchedAt: string;
  arrivalAt?: string;
  etaMinutes?: number;
  spotLat: number;
  spotLng: number;
}

export interface ParkingSchedule {
  id: string;
  memberId: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
  scheduleType: "weekly" | "daily";
  daysOfWeek: number[];
  arrivalWindowStart?: string;
  arrivalWindowEnd?: string;
  departureWindowStart?: string;
  departureWindowEnd?: string;
  role: "arriver" | "departor" | "both";
}

export interface Beacon {
  id: string;
  departureTime: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: "searching" | "matched" | "expired";
}
