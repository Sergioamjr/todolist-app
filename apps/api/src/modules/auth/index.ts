import Elysia from 'elysia'
import { betterAuth } from 'better-auth'
import { db } from '../../db'

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  trustedOrigins: ['http://localhost:3000'],
})

export const authGuard = new Elysia({ name: 'auth-guard' })
  .derive({ as: 'scoped' }, async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    return { userId: session?.user.id }
  })
  .onBeforeHandle({ as: 'scoped' }, ({ userId, set }) => {
    if (!userId) {
      set.status = 401
      return 'Unauthorized'
    }
  })
