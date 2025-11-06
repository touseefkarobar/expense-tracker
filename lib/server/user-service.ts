import { env } from "@/lib/env";

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  status: "active" | "inactive" | "blocked" | "unknown";
}

interface AppwriteUserResponse {
  users: Array<{
    $id: string;
    email: string;
    name?: string | null;
    status: boolean;
  }>;
}

export async function searchProjectUsers(query: string, limit = 8): Promise<UserSummary[]> {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return [];
  }

  const url = new URL(`${env.server.APPWRITE_ENDPOINT}/users`);
  url.searchParams.set("search", trimmed);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": env.server.APPWRITE_PROJECT_ID,
      "X-Appwrite-Key": env.server.APPWRITE_API_KEY
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = `Unable to search users (status ${response.status})`;
    throw new Error(message);
  }

  const payload = (await response.json()) as AppwriteUserResponse;

  return payload.users.map(user => ({
    id: user.$id,
    email: user.email,
    name: user.name?.trim() || user.email,
    status: user.status ? "active" : "inactive"
  }));
}
