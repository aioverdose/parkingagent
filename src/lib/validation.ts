import { z } from "zod";

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map(i => i.message).join("; "), result.error.issues);
  }
  return result.data;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: z.ZodIssue[],
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ── Shared primitives ───────────────────────────────────────────

const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);
const email = z.string().email().max(255).transform((v) => v.toLowerCase());
const password = z.string().min(6).max(128);
const phone = z.string().min(1).max(20);

const vehicleTypeEnum = z.enum(["car", "motorcycle", "bike", "truck"]).optional().nullable();
const vehicleSizeEnum = z.enum(["compact", "standard", "large"]).optional().nullable();

// ── Auth ─────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email,
  password,
  phone: z.string().max(20).optional().default(""),
  completedModuleIds: z.array(z.string()).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password,
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  currentPassword: z.string().optional(),
  newPassword: password.optional(),
  vehicleType: vehicleTypeEnum,
  vehicleSize: vehicleSizeEnum,
  vehicleMake: z.string().max(50).optional(),
  vehicleModel: z.string().max(50).optional(),
  licensePlate: z.string().max(20).optional(),
});

export const requestPhoneVerificationSchema = z.object({
  phone: z.string().regex(/^\d{10,15}$/, "Valid phone number required"),
  userId: z.string().optional(),
});

export const verifyPhoneSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  code: z.string().min(1, "Code is required"),
});

// ── Pairing ──────────────────────────────────────────────────────

export const pairingOfferSchema = z.object({
  latitude,
  longitude,
  address: z.string().max(500).optional().default(""),
  expectedDeparture: z.string().optional().nullable(),
  vehicleType: vehicleTypeEnum,
  vehicleSize: vehicleSizeEnum,
});


export const pairingMatchSchema = z.object({
  offerId: z.string().optional(),
  arrivingUserId: z.string().min(1, "arrivingUserId is required"),
  mode: z.enum(["auto"]).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const pairingAcceptSchema = z.object({
  matchId: z.string().min(1, "matchId is required"),
  action: z.enum(["accept", "cancel"], 'action must be "accept" or "cancel"'),
});

// ── Beacon ───────────────────────────────────────────────────────

export const beaconActivateSchema = z.object({
  departureTime: z.string().min(1, "departureTime is required"),
  latitude: z.union([z.string(), z.number()]).transform(Number),
  longitude: z.union([z.string(), z.number()]).transform(Number),
});

// ── Push ─────────────────────────────────────────────────────────

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  auth: z.string().min(1),
  p256dh: z.string().min(1),
  userAgent: z.string().optional(),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().min(1, "Endpoint is required"),
});

// ── Scout ────────────────────────────────────────────────────────

export const scoutAnchorSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const scoutClaimSchema = z.object({
  anchorId: z.string().min(1, "anchorId is required"),
});

export const scoutConfirmParkingSchema = z.object({
  anchorId: z.string().min(1, "anchorId is required"),
  success: z.boolean(),
});

// ── Realtime ─────────────────────────────────────────────────────

export const realtimeArrivalSchema = z.object({
  latitude: z.union([z.string(), z.number()]).transform(Number),
  longitude: z.union([z.string(), z.number()]).transform(Number),
  expandRadius: z.number().int().min(0).optional().default(0),
});

// ── Parking match schedule ──────────────────────────────────────

export const parkingMatchScheduleSchema = z.object({
  leavingTime: z.string().min(1, "leavingTime is required"),
  arrivalLookingTime: z.string().min(1, "arrivalLookingTime is required"),
  neighborhoodId: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  carType: z.enum(["small", "standard", "large"]).optional(),
});

// ── Parking match actions ───────────────────────────────────────

export const preScheduledScheduleSchema = z.object({
  neighborhoodId: z.string().min(1, "neighborhoodId is required"),
  neighborhoodName: z.string().min(1, "neighborhoodName is required"),
  scheduleType: z.enum(["work", "event", "shift", "other"]).default("other"),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, "Choose at least one day"),
  arrivalWindowStart: z.number().int().min(0).max(1439),
  arrivalWindowEnd: z.number().int().min(0).max(1439),
  departureWindowStart: z.number().int().min(0).max(1439),
  departureWindowEnd: z.number().int().min(0).max(1439),
  frequency: z.enum(["daily", "weekly", "biweekly"]).default("weekly"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  role: z.enum(["arriver", "departor", "both"]).default("both"),
});

export const runMatchingForNeighborhoodSchema = z.object({
  neighborhoodId: z.string().optional(),
});

export const parkingMatchActionSchema = z.object({
  matchId: z.string().min(1, "matchId is required"),
});

// ── Ranking ──────────────────────────────────────────────────────

export const rankingUpdateSchema = z.object({
  action: z.enum(["no-show", "cancel", ""]).optional(),
  targetUserId: z.string().optional(),
});

// ── Stripe ───────────────────────────────────────────────────────

export const stripeCheckoutSchema = z.object({
  priceType: z.enum(["monthly", "annual"], 'priceType must be "monthly" or "annual"'),
});
