import { t } from 'elysia'

export const SignUpBody = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
})

export const SignInBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
})

export const ForgotPasswordBody = t.Object({
  email: t.String({ format: 'email' }),
  redirectTo: t.Optional(t.String()),
})

export const ResetPasswordBody = t.Object({
  token: t.String(),
  newPassword: t.String({ minLength: 8 }),
})
