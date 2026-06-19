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

export const systemMetrics = pgTable("system_metrics", {
  id: text("id").primaryKey(),
  averageMatchTimeSeconds: real("average_match_time_seconds")
    .notNull()
    .default(4.2),
  averageArrivalTimeMinutes: real("average_arrival_time_minutes")
    .notNull()
    .default(6.8),
});
