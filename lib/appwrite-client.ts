import { Account, Avatars, Client, Databases, Functions, Storage, Teams } from "appwrite";

const createClient = () => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!endpoint || !project) {
    throw new Error("Missing Appwrite client configuration. Check NEXT_PUBLIC_APPWRITE_* env vars.");
  }

  return new Client().setEndpoint(endpoint).setProject(project);
};

const client = createClient();

export const browserAccount = new Account(client);
export const browserDatabases = new Databases(client);
export const browserStorage = new Storage(client);
export const browserFunctions = new Functions(client);
export const browserTeams = new Teams(client);
export const browserAvatars = new Avatars(client);

export { client as browserClient };
