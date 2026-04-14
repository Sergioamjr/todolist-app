import { betterAuth, BetterAuthOptions } from 'better-auth'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import { db } from '../../db'

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({ client: db as any }),
    type: 'sqlite',
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[password-reset] Send link to ${user.email}: ${url}`)
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ['http://localhost:3000'],
} satisfies BetterAuthOptions)
