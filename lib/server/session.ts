import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/server/auth-actions";
import { env } from "@/lib/env";

export interface SessionAccount {
  $id: string;
  name?: string | null;
  email: string;
  registration: string;
  status: boolean;
}

async function fetchAccount(secret: string): Promise<SessionAccount | null> {
  try {
    const response = await fetch(`${env.server.APPWRITE_ENDPOINT}/account`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": env.server.APPWRITE_PROJECT_ID,
        "X-Appwrite-Session": secret
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as SessionAccount;
    return data;
  } catch (error) {
    console.error("fetchAccount", error);
    return null;
  }
}

export async function getCurrentAccount(): Promise<SessionAccount | null> {
  const secret = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!secret) {
    return null;
  }

  return fetchAccount(secret);
}
