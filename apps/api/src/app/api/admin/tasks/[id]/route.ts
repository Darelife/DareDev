import { NextRequest, NextResponse } from "next/server";
import { getFirestoreDb } from "@/lib/firestore";
import { getSessionUser } from "@/lib/session";
import { TaskUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    if (!(await getSessionUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const ref = getFirestoreDb().collection("tasks").doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    const parsed = TaskUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    await ref.update(parsed.data);
    return NextResponse.json({ success: true, task: { id, ...existing.data(), ...parsed.data } });
  } catch (error) {
    console.error("Admin task PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    if (!(await getSessionUser())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const ref = getFirestoreDb().collection("tasks").doc(id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin task DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
