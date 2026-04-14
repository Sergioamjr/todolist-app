import { auth } from './better-auth'

export interface SignUpData {
  name: string
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ForgotPasswordData {
  email: string
  redirectTo: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
}

export interface IAuthRepository {
  signUp(data: SignUpData): Promise<{ headers: Headers; response: unknown }>
  signIn(data: SignInData): Promise<{ headers: Headers; response: unknown }>
  forgotPassword(data: ForgotPasswordData): Promise<unknown>
  resetPassword(data: ResetPasswordData): Promise<unknown>
}

export class BetterAuthRepository implements IAuthRepository {
  async signUp(data: SignUpData) {
    const { headers, response } = await auth.api.signUpEmail({
      body: data,
      returnHeaders: true,
    })
    return { headers, response }
  }

  async signIn(data: SignInData) {
    const { headers, response } = await auth.api.signInEmail({
      body: data,
      returnHeaders: true,
    })
    return { headers, response }
  }

  async forgotPassword(data: ForgotPasswordData) {
    return auth.api.requestPasswordReset({ body: data })
  }

  async resetPassword(data: ResetPasswordData) {
    return auth.api.resetPassword({ body: data })
  }
}
