import { and, desc, eq, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { containers, logs, userSettings } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

const containerInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  capacity_ml: z.number().int().positive(),
  emoji: z.string().min(1).max(80),
  created_at: z.number().int().positive(),
});

const logInput = z.object({
  id: z.string().min(1),
  container_id: z.string().min(1),
  amount_ml: z.number().int().positive(),
  timestamp: z.number().int().positive(),
});

const settingsInput = z.object({
  daily_goal_ml: z.number().int().min(500).max(10000).optional(),
  unit_preference: z.enum(["ml", "oz"]).optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
  wake_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  sleep_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
});

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database is not configured");
  }
  return db;
}

function toContainer(row: typeof containers.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    capacity_ml: row.capacityMl,
    emoji: row.iconKey,
    created_at: row.createdAt.getTime(),
  };
}

function toLog(row: typeof logs.$inferSelect) {
  return {
    id: row.id,
    container_id: row.containerId ?? "default:water",
    amount_ml: row.amountMl,
    timestamp: row.loggedAt.getTime(),
  };
}

function toSettings(row: typeof userSettings.$inferSelect | undefined) {
  if (!row) return null;
  return {
    daily_goal_ml: row.dailyGoalMl,
    unit_preference: row.unitPreference as "ml" | "oz",
    theme: row.theme as "light" | "dark" | "auto",
    wake_time: row.wakeTime,
    sleep_time: row.sleepTime,
  };
}

export const hydrationRouter = router({
  containers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const rows = await db
        .select()
        .from(containers)
        .where(eq(containers.userId, ctx.user.id))
        .orderBy(desc(containers.createdAt));
      return rows.map(toContainer);
    }),
    upsert: protectedProcedure.input(containerInput).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const now = new Date();
      const existing = await db
        .select()
        .from(containers)
        .where(eq(containers.id, input.id))
        .limit(1);
      if (existing[0] && existing[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Container belongs to another user" });
      }

      await db
        .insert(containers)
        .values({
          id: input.id,
          userId: ctx.user.id,
          name: input.name.trim(),
          capacityMl: input.capacity_ml,
          iconKey: input.emoji,
          createdAt: new Date(input.created_at),
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: containers.id,
          set: {
            name: input.name.trim(),
            capacityMl: input.capacity_ml,
            iconKey: input.emoji,
            updatedAt: now,
          },
        });
      return { success: true } as const;
    }),
    delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db
        .delete(containers)
        .where(and(eq(containers.id, input.id), eq(containers.userId, ctx.user.id)));
      return { success: true } as const;
    }),
  }),

  logs: router({
    list: protectedProcedure
      .input(
        z
          .object({
            start: z.number().int().positive().optional(),
            end: z.number().int().positive().optional(),
          })
          .optional(),
      )
      .query(async ({ ctx, input }) => {
        const db = await requireDb();
        const clauses = [eq(logs.userId, ctx.user.id)];
        if (input?.start) clauses.push(gte(logs.loggedAt, new Date(input.start)));
        if (input?.end) clauses.push(lt(logs.loggedAt, new Date(input.end)));

        const rows = await db
          .select()
          .from(logs)
          .where(and(...clauses))
          .orderBy(desc(logs.loggedAt));
        return rows.map(toLog);
      }),
    add: protectedProcedure.input(logInput).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      let containerId: string | null = null;
      if (!input.container_id.startsWith("default:")) {
        const matchingContainer = await db
          .select()
          .from(containers)
          .where(and(eq(containers.id, input.container_id), eq(containers.userId, ctx.user.id)))
          .limit(1);
        if (!matchingContainer[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Container not found" });
        }
        containerId = input.container_id;
      }

      await db.insert(logs).values({
        id: input.id,
        userId: ctx.user.id,
        containerId,
        amountMl: input.amount_ml,
        loggedAt: new Date(input.timestamp),
      });
      return { success: true } as const;
    }),
    delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.delete(logs).where(and(eq(logs.id, input.id), eq(logs.userId, ctx.user.id)));
      return { success: true } as const;
    }),
  }),

  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const rows = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);
      return toSettings(rows[0]);
    }),
    update: protectedProcedure.input(settingsInput).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      const now = new Date();
      const values = {
        userId: ctx.user.id,
        dailyGoalMl: input.daily_goal_ml ?? existing[0]?.dailyGoalMl ?? 3000,
        unitPreference: input.unit_preference ?? existing[0]?.unitPreference ?? "ml",
        theme: input.theme ?? existing[0]?.theme ?? "auto",
        wakeTime: input.wake_time ?? existing[0]?.wakeTime ?? null,
        sleepTime: input.sleep_time ?? existing[0]?.sleepTime ?? null,
        updatedAt: now,
      };

      await db
        .insert(userSettings)
        .values({
          ...values,
          createdAt: existing[0]?.createdAt ?? now,
        })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: values,
        });

      return toSettings({
        ...values,
        createdAt: existing[0]?.createdAt ?? now,
      });
    }),
  }),
});
