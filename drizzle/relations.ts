import { relations } from "drizzle-orm";
import { containers, logs, users, userSettings } from "./schema";

export const usersRelations = relations(users, ({ many, one }) => ({
  containers: many(containers),
  logs: many(logs),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));

export const containersRelations = relations(containers, ({ one, many }) => ({
  user: one(users, {
    fields: [containers.userId],
    references: [users.id],
  }),
  logs: many(logs),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  user: one(users, {
    fields: [logs.userId],
    references: [users.id],
  }),
  container: one(containers, {
    fields: [logs.containerId],
    references: [containers.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
