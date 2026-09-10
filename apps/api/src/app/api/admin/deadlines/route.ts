import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firestore";
import { getSessionUser } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { DeadlineInputSchema } from "@/lib/validation";

function mapDeadline(id: string, data: Record<string, any>) {
  return {
    id,
    content: data.content,
    targetDate: data.targetDate,
    targetTime: data.targetTime,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!(await getSessionUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rate = checkRateLimit(`deadlines:get:${getClientIp(request.headers)}`, 60, 60_000);
    if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const snapshot = await getFirestoreDb().collection("deadlines").get();
    const deadlines = snapshot.docs
      .map((doc) => mapDeadline(doc.id, doc.data()))
      .sort((a, b) => `${a.targetDate}T${a.targetTime}`.localeCompare(`${b.targetDate}T${b.targetTime}`));
    return NextResponse.json({ success: true, deadlines });
  } catch (error) {
    console.error("Admin deadlines GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getSessionUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rate = checkRateLimit(`deadlines:post:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const parsed = DeadlineInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    const ref = getFirestoreDb().collection("deadlines").doc();
    const data = { ...parsed.data, createdAt: new Date() };
    await ref.set(data);
    return NextResponse.json({ success: true, deadline: mapDeadline(ref.id, data) }, { status: 201 });
  } catch (error) {
    console.error("Admin deadlines POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
