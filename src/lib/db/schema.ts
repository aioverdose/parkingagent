import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
    isMember: boolean("is_member").notNull().default(false),
    isAdmin: boolean("is_admin").notNull().default(false),
    rankingScore: integer("ranking_score").notNull().default(0),
    status: text("status", {
      enum: ["good-standing", "suspended", "pending"],
    })
      .notNull()
      .default("pending"),
    membershipType: text("membership_type", {
      enum: ["monthly", "annual", "none"],
    })
      .notNull()
      .default("none"),
    completedCourses: boolean("completed_courses").notNull().default(false),
    vehicleType: text("vehicle_type", { enum: ["car", "motorcycle", "bike", "truck"] }),
    vehicleSize: text("vehicle_size", { enum: ["compact", "standard", "large"] }),
    vehicleMake: text("vehicle_make"),
    vehicleModel: text("vehicle_model"),
    licensePlate: text("license_plate"),
    phone: text("phone"),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    pushSubscription: text("push_subscription"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status", {
      enum: ["active", "past_due", "canceled", "incomplete", "none"],
    })
      .notNull()
      .default("none"),
    subscriptionPeriodEnd: text("subscription_period_end"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    isPremium: boolean("is_premium").notNull().default(false),
    premiumUntil: text("premium_until"),
    tier: text("tier", { enum: ["free", "free_1year", "premium", "premium_pending"] }).notNull().default("free"),
    signupNumber: integer("signup_number"),
    ranking: integer("ranking").notNull().default(5),
    matchCount: integer("match_count").notNull().default(0),
    cancelCount: integer("cancel_count").notNull().default(0),
    noShowCount: integer("no_show_count").notNull().default(0),
    neighborhood: text("neighborhood"),
    anchorCount: integer("anchor_count").notNull().default(0),
    successfulMatches: integer("successful_matches").notNull().default(0),
    failedMatches: integer("failed_matches").notNull().default(0),
    scoutLevel: integer("scout_level").notNull().default(1),
    scoutPoints: integer("scout_points").notNull().default(0),
    scoutBadges: text("scout_badges").notNull().default("[]"),
    joinedDate: text("joined_date").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  spotOffers: many(spotOffers),
  departingMatches: many(matches, { relationName: "departingUser" }),
  arrivingMatches: many(matches, { relationName: "arrivingUser" }),
  courseCompletions: many(userCourseCompletions),
  referralCodes: many(referralCodes),
  referredBy: many(referrals, { relationName: "referrer" }),
  referredUsers: many(referrals, { relationName: "referred" }),
  scoutAnchors: many(spotAnchors, { relationName: "scoutAnchors" }),
  minerClaims: many(spotAnchors, { relationName: "minerClaims" }),
}));

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const spotOffers = pgTable(
  "spot_offers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    address: text("address"),
    status: text("status", {
      enum: ["available", "matched", "completed", "expired"],
    })
      .notNull()
      .default("available"),
    expectedDeparture: text("expected_departure"),
    vehicleType: text("vehicle_type", {
      enum: ["car", "motorcycle", "bike", "truck"],
    }),
    vehicleSize: text("vehicle_size", {
      enum: ["compact", "standard", "large"],
    }),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    statusIdx: index("spot_offers_status_idx").on(table.status),
    userIdx: index("spot_offers_user_idx").on(table.userId),
  }),
);

export const spotOffersRelations = relations(spotOffers, ({ one }) => ({
  user: one(users, {
    fields: [spotOffers.userId],
    references: [users.id],
  }),
  match: one(matches, {
    fields: [spotOffers.id],
    references: [matches.spotOfferId],
  }),
}));

export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey(),
    spotOfferId: text("spot_offer_id").references(() => spotOffers.id, {
      onDelete: "set null",
    }),
    departingUserId: text("departing_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    arrivingUserId: text("arriving_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["active", "completed", "cancelled", "expired"],
    })
      .notNull()
      .default("active"),
    matchedAt: text("matched_at").notNull(),
    arrivalAt: text("arrival_at"),
    etaMinutes: integer("eta_minutes"),
    spotLatitude: real("spot_latitude").notNull(),
    spotLongitude: real("spot_longitude").notNull(),
  },
  (table) => ({
    statusIdx: index("matches_status_idx").on(table.status),
    departingIdx: index("matches_departing_idx").on(table.departingUserId),
    arrivingIdx: index("matches_arriving_idx").on(table.arrivingUserId),
  }),
);

export const matchesRelations = relations(matches, ({ one }) => ({
  departingUser: one(users, {
    fields: [matches.departingUserId],
    references: [users.id],
    relationName: "departingUser",
  }),
  arrivingUser: one(users, {
    fields: [matches.arrivingUserId],
    references: [users.id],
    relationName: "arrivingUser",
  }),
  spotOffer: one(spotOffers, {
    fields: [matches.spotOfferId],
    references: [spotOffers.id],
  }),
}));

export const courseModules = pgTable("course_modules", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  isActive: boolean("is_active").notNull().default(true),
  required: boolean("required").notNull().default(true),
  lastUpdated: text("last_updated"),
});

export const courseModulesRelations = relations(courseModules, ({ many }) => ({
  completions: many(userCourseCompletions),
}));

export const userCourseCompletions = pgTable("user_course_completions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  moduleId: text("module_id")
    .notNull()
    .references(() => courseModules.id, { onDelete: "cascade" }),
  completedAt: text("completed_at").notNull(),
});

export const userCourseCompletionsRelations = relations(
  userCourseCompletions,
  ({ one }) => ({
    user: one(users, {
      fields: [userCourseCompletions.userId],
      references: [users.id],
    }),
    module: one(courseModules, {
      fields: [userCourseCompletions.moduleId],
      references: [courseModules.id],
    }),
  }),
);

export const cmsContent = pgTable(
  "cms_content",
  {
    id: text("id").primaryKey(),
    page: text("page").notNull(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    pageKeyIdx: uniqueIndex("cms_page_key_idx").on(table.page, table.key),
  }),
);

export const cmsVersions = pgTable("cms_versions", {
  id: text("id").primaryKey(),
  page: text("page").notNull(),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  content: jsonb("content").notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const revenueEntries = pgTable("revenue_entries", {
  id: text("id").primaryKey(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  revenue: real("revenue").notNull(),
});

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    auth: text("auth").notNull(),
    p256dh: text("p256dh").notNull(),
    userAgent: text("user_agent"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    userIdx: index("push_sub_user_idx").on(table.userId),
  }),
);

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    usedAt: text("used_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("password_reset_token_idx").on(table.token),
  }),
);

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const referralCodes = pgTable(
  "referral_codes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("referral_code_idx").on(table.code),
    userIdx: index("referral_code_user_idx").on(table.userId),
  }),
);

export const referralCodesRelations = relations(referralCodes, ({ one }) => ({
  user: one(users, {
    fields: [referralCodes.userId],
    references: [users.id],
  }),
}));

export const referrals = pgTable(
  "referrals",
  {
    id: text("id").primaryKey(),
    referrerId: text("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredId: text("referred_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeUsed: text("code_used").notNull(),
    status: text("status", {
      enum: ["pending", "converted", "rewarded"],
    })
      .notNull()
      .default("pending"),
    convertedAt: text("converted_at"),
    rewardedAt: text("rewarded_at"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    invoiceId: text("invoice_id"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    referrerIdx: index("referrals_referrer_idx").on(table.referrerId),
    referredIdx: index("referrals_referred_idx").on(table.referredId),
    statusIdx: index("referrals_status_idx").on(table.status),
  }),
);

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

// ── Phone Verification ─────────────────────────────────────────

export const phoneVerifications = pgTable(
  "phone_verifications",
  {
    id: text("id").primaryKey(),
    phone: text("phone").notNull(),
    code: text("code").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    verified: boolean("verified").notNull().default(false),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    phoneIdx: index("pv_phone_idx").on(table.phone),
  }),
);

// ── Optional Parking Match ──────────────────────────────────────

export const parkingMatchSchedules = pgTable(
  "parking_match_schedules",
  {
    id: text("id").primaryKey(),
    memberId: text("member_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    leavingTime: integer("leaving_time").notNull(),
    arrivalLookingTime: integer("arrival_looking_time").notNull(),
    neighborhoodId: text("neighborhood_id"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    carType: text("car_type", { enum: ["small", "standard", "large"] }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    memberIdx: index("pms_member_idx").on(table.memberId),
    activeIdx: index("pms_active_idx").on(table.isActive),
  }),
);

export const parkingMatchSchedulesRelations = relations(
  parkingMatchSchedules,
  ({ one }) => ({
    member: one(users, {
      fields: [parkingMatchSchedules.memberId],
      references: [users.id],
    }),
  }),
);

export const parkingMatches = pgTable(
  "parking_matches",
  {
    id: text("id").primaryKey(),
    leavingMemberId: text("leaving_member_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    arrivingMemberId: text("arriving_member_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    leavingScheduleId: text("leaving_schedule_id")
      .notNull()
      .references(() => parkingMatchSchedules.id, { onDelete: "set null" }),
    arrivingScheduleId: text("arriving_schedule_id")
      .notNull()
      .references(() => parkingMatchSchedules.id, { onDelete: "set null" }),
    status: text("status", {
      enum: ["pending", "confirmed", "cancelled", "expired"],
    })
      .notNull()
      .default("pending"),
    toleranceMinutes: integer("tolerance_minutes").notNull().default(15),
    matchedAt: text("matched_at").notNull(),
    confirmed: boolean("confirmed").notNull().default(false),
    confirmedAt: text("confirmed_at"),
    failedAt: text("failed_at"),
    rated: boolean("rated").notNull().default(false),
    rating: integer("rating"),
    alarmMinutes: integer("alarm_minutes").notNull().default(0),
  },
  (table) => ({
    leavingIdx: index("pm_leaving_idx").on(table.leavingMemberId),
    arrivingIdx: index("pm_arriving_idx").on(table.arrivingMemberId),
    statusIdx: index("pm_status_idx").on(table.status),
  }),
);

export const parkingMatchesRelations = relations(parkingMatches, ({ one }) => ({
  leavingMember: one(users, {
    fields: [parkingMatches.leavingMemberId],
    references: [users.id],
    relationName: "leavingMember",
  }),
  arrivingMember: one(users, {
    fields: [parkingMatches.arrivingMemberId],
    references: [users.id],
    relationName: "arrivingMember",
  }),
}));

// ── Departure Beacons ───────────────────────────────────────────

export const parkingBeacons = pgTable(
  "parking_beacons",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    departureTime: text("departure_time").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    radius: integer("radius").notNull().default(5),
    status: text("status", {
      enum: ["searching", "matched", "expired"],
    })
      .notNull()
      .default("searching"),
    matchedMemberId: text("matched_member_id").references(() => users.id, {
      onDelete: "set null",
    }),
    matchedAt: text("matched_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    userIdx: index("pb_user_idx").on(table.userId),
    statusIdx: index("pb_status_idx").on(table.status),
  }),
);

export const parkingBeaconsRelations = relations(parkingBeacons, ({ one }) => ({
  user: one(users, {
    fields: [parkingBeacons.userId],
    references: [users.id],
  }),
  matchedMember: one(users, {
    fields: [parkingBeacons.matchedMemberId],
    references: [users.id],
  }),
}));

// ── Spot Anchors ────────────────────────────────────────────────

export const spotAnchors = pgTable(
  "spot_anchors",
  {
    id: text("id").primaryKey(),
    scoutId: text("scout_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    neighborhood: text("neighborhood").notNull().default("Unknown"),
    timestamp: real("timestamp").notNull(),
    status: text("status", {
      enum: ["active", "claimed", "completed", "failed"],
    })
      .notNull()
      .default("active"),
    minerId: text("miner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    scoutIdx: index("sa_scout_idx").on(table.scoutId),
    statusIdx: index("sa_status_idx").on(table.status),
    minerIdx: index("sa_miner_idx").on(table.minerId),
  }),
);

export const spotAnchorsRelations = relations(spotAnchors, ({ one }) => ({
  scout: one(users, {
    fields: [spotAnchors.scoutId],
    references: [users.id],
    relationName: "scoutAnchors",
  }),
  miner: one(users, {
    fields: [spotAnchors.minerId],
    references: [users.id],
    relationName: "minerClaims",
  }),
}));

export const favoriteMembers = pgTable(
  "favorite_members",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    userIdx: index("fm_user_idx").on(table.userId),
    memberIdx: index("fm_member_idx").on(table.memberId),
  }),
);

export const favoriteMembersRelations = relations(favoriteMembers, ({ one }) => ({
  user: one(users, {
    fields: [favoriteMembers.userId],
    references: [users.id],
  }),
  member: one(users, {
    fields: [favoriteMembers.memberId],
    references: [users.id],
  }),
}));

// ── Live Locations ─────────────────────────────────────────────

export const liveLocations = pgTable(
  "live_locations",
  {
    id: text("id").primaryKey(),
    matchId: text("match_id")
      .notNull()
      .references(() => parkingMatches.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    heading: real("heading"),
    speed: real("speed"),
    timestamp: text("timestamp").notNull(),
  },
  (table) => ({
    matchIdx: index("ll_match_idx").on(table.matchId),
    userIdx: index("ll_user_idx").on(table.userId),
  }),
);

export const liveLocationsRelations = relations(liveLocations, ({ one }) => ({
  match: one(parkingMatches, {
    fields: [liveLocations.matchId],
    references: [parkingMatches.id],
  }),
  user: one(users, {
    fields: [liveLocations.userId],
    references: [users.id],
  }),
}));

// ── System Metrics ──────────────────────────────────────────────

export const systemMetrics = pgTable("system_metrics", {
  id: text("id").primaryKey(),
  averageMatchTimeSeconds: real("average_match_time_seconds")
    .notNull()
    .default(4.2),
  averageArrivalTimeMinutes: real("average_arrival_time_minutes")
    .notNull()
    .default(6.8),
});
