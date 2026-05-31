import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const userRole = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const containers = pgTable("containers", {
  id: varchar("id", { length: 80 }).primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  capacityMl: integer("capacityMl").notNull(),
  iconKey: varchar("iconKey", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const logs = pgTable("logs", {
  id: varchar("id", { length: 80 }).primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  containerId: varchar("containerId", { length: 80 }).references(() => containers.id, {
    onDelete: "set null",
  }),
  amountMl: integer("amountMl").notNull(),
  loggedAt: timestamp("loggedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  userId: integer("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  dailyGoalMl: integer("dailyGoalMl").notNull(),
  unitPreference: varchar("unitPreference", { length: 8 }).notNull().default("ml"),
  theme: varchar("theme", { length: 12 }).notNull().default("auto"),
  wakeTime: varchar("wakeTime", { length: 5 }),
  sleepTime: varchar("sleepTime", { length: 5 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Container = typeof containers.$inferSelect;
export type InsertContainer = typeof containers.$inferInsert;
export type Log = typeof logs.$inferSelect;
export type InsertLog = typeof logs.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;
