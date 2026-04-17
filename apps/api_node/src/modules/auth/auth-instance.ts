import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { createClient } from "@libsql/client";

(() => {
  if (!process.env.DB_URL) {
    console.warn("DB_URL is not set");
  }
  if (!process.env.BETTER_AUTH_URL) {
    console.warn(
      "BETTER_AUTH_URL is not set, auth URLs may not work correctly",
    );
  }
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn(
      "Google OAuth credentials are not set, Google login will not work",
    );
  }
})();

const client = createClient({
  url: process.env.DB_URL ?? "",
  authToken: process.env.DB_AUTH_TOKEN,
});

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({ client: client as any }),
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[password-reset] ${user.email}: ${url}`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.UI_URL ?? "", "http://localhost:3000"],
});
