import { NextResponse } from "next/server";

import { getCurrentAccount } from "@/lib/server/session";
import { searchProjectUsers } from "@/lib/server/user-service";

export async function GET(request: Request) {
  const account = await getCurrentAccount();

  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await searchProjectUsers(query, 10);
    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to search users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
