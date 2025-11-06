import { Account, Client, Databases, Functions, ID, Storage, Teams } from "appwrite";
import { env } from "@/lib/env";

export const serverClient = new Client()
  .setEndpoint(env.server.APPWRITE_ENDPOINT)
  .setProject(env.server.APPWRITE_PROJECT_ID)
  .setKey(env.server.APPWRITE_API_KEY);

export const account = new Account(serverClient);
export const databases = new Databases(serverClient);
export const teams = new Teams(serverClient);
export const storage = new Storage(serverClient);
export const functions = new Functions(serverClient);

export { ID };
