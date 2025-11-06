"use server";

import { cookies } from "next/headers";
import { ID, account } from "@/lib/server/appwrite";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().min(1).optional()
});

const COOKIE_NAME = "appwrite-session" as const;

function setSessionCookie(secret: string) {
  cookies().set(COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function registerUser(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name")
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.flatten().fieldErrors.email?.[0] ??
        parsed.error.flatten().fieldErrors.password?.[0] ??
        parsed.error.flatten().fieldErrors.name?.[0] ??
        "Invalid registration details."
    } as const;
  }

  const { email, password, name } = parsed.data;

  try {
    await account.create(ID.unique(), email, password, name ?? undefined);
    const session = await account.createEmailPasswordSession(email, password);
    if (!session.secret) {
      throw new Error("Appwrite session secret was not returned.");
    }
    setSessionCookie(session.secret);
    return { success: true } as const;
  } catch (error) {
    console.error("registerUser", error);
    return {
      success: false,
      error: "Unable to register. Please try again."
    } as const;
  }
}

export async function loginUser(formData: FormData) {
  const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors?.[0] ?? "Invalid credentials."
    } as const;
  }

  const { email, password } = parsed.data;

  try {
    const session = await account.createEmailPasswordSession(email, password);
    if (!session.secret) {
      throw new Error("Appwrite session secret was not returned.");
    }
    setSessionCookie(session.secret);
    return { success: true } as const;
  } catch (error) {
    console.error("loginUser", error);
    return {
      success: false,
      error: "Unable to sign in. Check your email and password."
    } as const;
  }
}

export async function logoutUser() {
  try {
    await account.deleteSession("current");
    cookies().delete({ name: COOKIE_NAME, path: "/" });
    return { success: true } as const;
  } catch (error) {
    console.error("logoutUser", error);
    return {
      success: false,
      error: "Unable to log out."
    } as const;
  }
}
