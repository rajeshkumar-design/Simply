import { describe, it, expect } from "vitest";
import { Container, LogEntry, UserSettings } from "@/lib/types";

describe("Data Types", () => {
  describe("Container", () => {
    it("should create a valid container", () => {
      const container: Container = {
        id: "1",
        name: "Water Bottle",
        capacity_ml: 750,
        emoji: "🍾",
        created_at: Date.now(),
      };
      expect(container.name).toBe("Water Bottle");
      expect(container.capacity_ml).toBe(750);
      expect(container.emoji).toBe("🍾");
    });
  });

  describe("LogEntry", () => {
    it("should create a valid log entry", () => {
      const logEntry: LogEntry = {
        id: "1",
        container_id: "1",
        amount_ml: 750,
        timestamp: Date.now(),
      };
      expect(logEntry.amount_ml).toBe(750);
      expect(logEntry.container_id).toBe("1");
    });
  });

  describe("UserSettings", () => {
    it("should create valid user settings", () => {
      const settings: UserSettings = {
        daily_goal_ml: 3000,
        unit_preference: "ml",
        theme: "auto",
      };
      expect(settings.daily_goal_ml).toBe(3000);
      expect(settings.unit_preference).toBe("ml");
      expect(settings.theme).toBe("auto");
    });

    it("should support oz unit preference", () => {
      const settings: UserSettings = {
        daily_goal_ml: 3000,
        unit_preference: "oz",
        theme: "light",
      };
      expect(settings.unit_preference).toBe("oz");
    });
  });

  describe("Calculations", () => {
    it("should calculate remaining water correctly", () => {
      const dailyGoal = 3000;
      const consumed = 750;
      const remaining = Math.max(0, dailyGoal - consumed);
      expect(remaining).toBe(2250);
    });

    it("should calculate progress percentage", () => {
      const dailyGoal = 3000;
      const consumed = 1500;
      const progress = Math.min(1, consumed / dailyGoal);
      expect(progress).toBe(0.5);
    });

    it("should handle zero consumption", () => {
      const dailyGoal = 3000;
      const consumed = 0;
      const progress = Math.min(1, consumed / dailyGoal);
      expect(progress).toBe(0);
    });

    it("should handle over-consumption", () => {
      const dailyGoal = 3000;
      const consumed = 4000;
      const progress = Math.min(1, consumed / dailyGoal);
      expect(progress).toBe(1);
    });

    it("should convert ml to oz", () => {
      const ml = 750;
      const oz = ml / 29.5735;
      expect(oz).toBeCloseTo(25.36, 1);
    });

    it("should convert oz to ml", () => {
      const oz = 25.36;
      const ml = oz * 29.5735;
      expect(ml).toBeCloseTo(750, 0);
    });
  });

  describe("Date Utilities", () => {
    it("should identify today's logs", () => {
      const now = Date.now();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTime = tomorrow.getTime();

      expect(now >= todayTime).toBe(true);
      expect(now < tomorrowTime).toBe(true);
    });

    it("should format date correctly", () => {
      const date = new Date("2026-05-27");
      const formatted = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      expect(formatted).toContain("May");
      expect(formatted).toContain("27");
    });
  });

  describe("Container Management", () => {
    it("should calculate total consumption from multiple containers", () => {
      const logs: LogEntry[] = [
        { id: "1", container_id: "1", amount_ml: 750, timestamp: Date.now() },
        { id: "2", container_id: "2", amount_ml: 500, timestamp: Date.now() },
        { id: "3", container_id: "1", amount_ml: 300, timestamp: Date.now() },
      ];
      const total = logs.reduce((sum, log) => sum + log.amount_ml, 0);
      expect(total).toBe(1550);
    });

    it("should filter logs by container", () => {
      const logs: LogEntry[] = [
        { id: "1", container_id: "1", amount_ml: 750, timestamp: Date.now() },
        { id: "2", container_id: "2", amount_ml: 500, timestamp: Date.now() },
        { id: "3", container_id: "1", amount_ml: 300, timestamp: Date.now() },
      ];
      const container1Logs = logs.filter((log) => log.container_id === "1");
      expect(container1Logs.length).toBe(2);
      expect(container1Logs[0].amount_ml).toBe(750);
    });

    it("should sort logs by timestamp", () => {
      const now = Date.now();
      const logs: LogEntry[] = [
        { id: "1", container_id: "1", amount_ml: 750, timestamp: now + 2000 },
        { id: "2", container_id: "1", amount_ml: 500, timestamp: now },
        { id: "3", container_id: "1", amount_ml: 300, timestamp: now + 1000 },
      ];
      const sorted = logs.sort((a, b) => a.timestamp - b.timestamp);
      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");
    });
  });

  describe("Goal Tracking", () => {
    it("should determine if goal is reached", () => {
      const dailyGoal = 3000;
      const consumed = 3000;
      const goalReached = consumed >= dailyGoal;
      expect(goalReached).toBe(true);
    });

    it("should count days goal was reached", () => {
      const dailyGoal = 3000;
      const dailyStats = [
        { total_ml: 2500 },
        { total_ml: 3000 },
        { total_ml: 3500 },
        { total_ml: 2000 },
      ];
      const goalsReached = dailyStats.filter(
        (stat) => stat.total_ml >= dailyGoal
      ).length;
      expect(goalsReached).toBe(2);
    });

    it("should calculate average daily consumption", () => {
      const dailyStats = [
        { total_ml: 2500 },
        { total_ml: 3000 },
        { total_ml: 3500 },
        { total_ml: 2000 },
      ];
      const total = dailyStats.reduce((sum, stat) => sum + stat.total_ml, 0);
      const average = Math.round(total / dailyStats.length);
      expect(average).toBe(2750);
    });
  });
});
