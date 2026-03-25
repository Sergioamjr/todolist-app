import Elysia from 'elysia'
import { betterAuth } from 'better-auth'
import { db } from '../../db'

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  trustedOrigins: ['http://localhost:3000'],
})

export const authGuard = new Elysia({ name: 'auth-guard' }).derive(
  { as: 'scoped' },
  async ({ request, error }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return error(401, 'Unauthorized')
    return { userId: session.user.id }
  }
)
