import { NextResponse } from "next/server";
import type { SessionUser } from "./auth";
import { getSessionUser } from "./session";

export async function requireAuth(): Promise<
  { user: SessionUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}
