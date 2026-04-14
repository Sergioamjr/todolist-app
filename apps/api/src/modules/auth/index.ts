import Elysia from 'elysia'
import { SignUpBody, SignInBody, ForgotPasswordBody, ResetPasswordBody } from './model'
import { authService } from './service'
export { auth } from './better-auth'
import { auth } from './better-auth'

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

export const authModule = new Elysia({ prefix: '/auth' })
  .post(
    '/register',
    async ({ body, set }) => {
      const { headers, response } = await authService.signUp(body)
      const cookies = headers.getSetCookie()
      if (cookies.length) set.headers['set-cookie'] = cookies.join(', ')
      return response
    },
    { body: SignUpBody }
  )
  .post(
    '/login',
    async ({ body, set }) => {
      const { headers, response } = await authService.signIn(body)
      const cookies = headers.getSetCookie()
      if (cookies.length) set.headers['set-cookie'] = cookies.join(', ')
      return response
    },
    { body: SignInBody }
  )
  .post(
    '/forgot-password',
    async ({ body }) => {
      return authService.forgotPassword({
        email: body.email,
        redirectTo: body.redirectTo ?? 'http://localhost:3000/reset-password',
      })
    },
    { body: ForgotPasswordBody }
  )
  .post(
    '/reset-password',
    async ({ body }) => {
      return authService.resetPassword(body)
    },
    { body: ResetPasswordBody }
  )
