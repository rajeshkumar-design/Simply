import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import { getUserByEmail, getUserByOpenId, upsertUser } from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function openIdForEmail(email: string) {
  const digest = createHash("sha256").update(normalizeEmail(email)).digest("base64url");
  return `email_${digest.slice(0, 50)}`;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("base64url")}`;
}

async function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [algorithm, salt, key] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !key) return false;

  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(key, "base64url");
  if (storedKey.length !== derivedKey.length) return false;

  return timingSafeEqual(storedKey, derivedKey);
}

function buildUserResponse(user: NonNullable<Awaited<ReturnType<typeof getUserByOpenId>>>) {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    lastSignedIn: user.lastSignedIn.toISOString(),
  };
}

function readCredentials(req: Request) {
  const email = typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

  return { email, password, name };
}

async function issueSession(req: Request, res: Response, user: NonNullable<Awaited<ReturnType<typeof getUserByOpenId>>>) {
  const sessionToken = await sdk.createSessionToken(user.openId, {
    name: user.name || user.email || "",
    expiresInMs: ONE_YEAR_MS,
  });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

  return {
    app_session_id: sessionToken,
    user: buildUserResponse(user),
  };
}

export function registerEmailAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = readCredentials(req);
    if (!email || !email.includes("@") || password.length < 8) {
      res.status(400).json({ error: "Enter a valid email and an 8+ character password" });
      return;
    }

    try {
      const existing = await getUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const openId = openIdForEmail(email);
      const now = new Date();
      await upsertUser({
        openId,
        email,
        name: name || null,
        passwordHash: await hashPassword(password),
        loginMethod: "email",
        lastSignedIn: now,
      });

      const user = await getUserByOpenId(openId);
      if (!user) {
        res.status(500).json({ error: "Failed to create account" });
        return;
      }

      res.json(await issueSession(req, res, user));
    } catch (error) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = readCredentials(req);
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    try {
      const user = await getUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      await upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      const refreshedUser = (await getUserByOpenId(user.openId)) ?? user;
      res.json(await issueSession(req, res, refreshedUser));
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
