import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getNextJsRequestIp } from "@/lib/ip";
import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

const authHandler = toNextJsHandler(auth);

const SIGNUP_LIMIT = 5;
const SIGNUP_WINDOW = 60 * 60;
const AUTH_LIMIT = 30;
const AUTH_WINDOW = 60 * 15;

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "");

  if (path === "/sign-up/email") {
    const ip = getNextJsRequestIp(req);
    const { allowed, retryAfterSec } = await rateLimit(
      `signup:${ip}`,
      SIGNUP_LIMIT,
      SIGNUP_WINDOW,
    );
    if (!allowed) {
      return NextResponse.json(
        {
          message: "Too many registration attempts. Please try again later.",
          retryAfter: retryAfterSec,
        },
        { status: 429 },
      );
    }
  }

  if (path === "/sign-in/email") {
    const ip = getNextJsRequestIp(req);
    const { allowed, retryAfterSec } = await rateLimit(
      `signin:${ip}`,
      AUTH_LIMIT,
      AUTH_WINDOW,
    );
    if (!allowed) {
      return NextResponse.json(
        {
          message: "Too many login attempts. Please try again later.",
          retryAfter: retryAfterSec,
        },
        { status: 429 },
      );
    }
  }

  return authHandler.POST(req);
}

export async function GET(req: NextRequest) {
  return authHandler.GET(req);
}