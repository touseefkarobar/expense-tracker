import { z } from "zod";

const serverSchema = z.object({
  APPWRITE_ENDPOINT: z.string().url(),
  APPWRITE_PROJECT_ID: z.string(),
  APPWRITE_API_KEY: z.string().min(1)
});

const clientSchema = z.object({
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url(),
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string()
});

declare global {
  // eslint-disable-next-line no-var
  var __env__: {
    server: z.infer<typeof serverSchema> | null;
    client: z.infer<typeof clientSchema> | null;
  } | undefined;
}

const globalForEnv = globalThis as unknown as {
  __env__?: {
    server: z.infer<typeof serverSchema> | null;
    client: z.infer<typeof clientSchema> | null;
  };
};

export const env = (() => {
  if (!globalForEnv.__env__) {
    const server = serverSchema.parse({
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
      APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY
    });

    const client = clientSchema.parse({
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    });

    globalForEnv.__env__ = { server, client };
  }

  return globalForEnv.__env__!;
})();

export type ServerEnv = typeof env.server;
export type ClientEnv = typeof env.client;
