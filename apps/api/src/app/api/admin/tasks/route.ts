import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firestore";
import type { DocumentData } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { TaskInputSchema } from "@/lib/validation";

function mapTask(id: string, data: DocumentData) {
  return {
    id,
    content: data.content,
    type: data.type,
    taskDate: data.taskDate,
    taskTime: data.taskTime,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rate = checkRateLimit(`tasks:get:${getClientIp(request.headers)}`, 60, 60_000);
    if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const snapshot = await getFirestoreDb().collection("tasks").get();
    const tasks = snapshot.docs
      .map((doc) => mapTask(doc.id, doc.data()))
      .sort((a, b) => `${a.taskDate}T${a.taskTime}`.localeCompare(`${b.taskDate}T${b.taskTime}`));
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Admin tasks GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rate = checkRateLimit(`tasks:post:${getClientIp(request.headers)}`, 30, 60_000);
    if (!rate.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const parsed = TaskInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

    const ref = getFirestoreDb().collection("tasks").doc();
    const data = { ...parsed.data, createdAt: new Date() };
    await ref.set(data);
    return NextResponse.json({ success: true, task: mapTask(ref.id, data) }, { status: 201 });
  } catch (error) {
    console.error("Admin tasks POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
