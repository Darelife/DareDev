import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getFirestoreDb } from "@/lib/firestore";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { CanvasSceneSchema } from "@/lib/validation";

const CANVAS_DOC_PATH = ["canvas", "main"] as const;

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`canvas:get:${ip}`, 60, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rate.retryAfterSeconds ? { "Retry-After": String(rate.retryAfterSeconds) } : undefined }
      );
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getFirestoreDb();
    const ref = db.doc(CANVAS_DOC_PATH.join("/"));
    const snap = await ref.get();

    if (!snap.exists) {
      const empty = {
        elements: [],
        appState: {},
        files: {},
        updatedAt: new Date().toISOString(),
        updatedBy: null,
      };
      await ref.set(empty);
      return NextResponse.json({ success: true, canvas: empty });
    }

    return NextResponse.json({ success: true, canvas: snap.data() });
  } catch (error) {
    console.error("Canvas load error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit(`canvas:post:${ip}`, 40, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: rate.retryAfterSeconds ? { "Retry-After": String(rate.retryAfterSeconds) } : undefined }
      );
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saveRate = checkRateLimit(`canvas:save:user:${user.id}`, 1, 10_000);
    if (!saveRate.allowed) {
      return NextResponse.json(
        { error: "Please wait 10 seconds before saving again" },
        { status: 429, headers: saveRate.retryAfterSeconds ? { "Retry-After": String(saveRate.retryAfterSeconds) } : undefined }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = CanvasSceneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid scene data" }, { status: 400 });
    }

    const scene = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };

    const db = getFirestoreDb();
    await db.doc(CANVAS_DOC_PATH.join("/")).set(scene);

    return NextResponse.json({ success: true, message: "Canvas saved" });
  } catch (error) {
    console.error("Canvas save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
