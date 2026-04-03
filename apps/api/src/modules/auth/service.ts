import {
  BetterAuthRepository,
  type IAuthRepository,
  type SignUpData,
  type SignInData,
  type ForgotPasswordData,
  type ResetPasswordData,
} from './repository'

export class AuthService {
  constructor(private readonly repo: IAuthRepository = new BetterAuthRepository()) {}

  signUp(data: SignUpData) {
    return this.repo.signUp(data)
  }

  signIn(data: SignInData) {
    return this.repo.signIn(data)
  }

  forgotPassword(data: ForgotPasswordData) {
    return this.repo.forgotPassword(data)
  }

  resetPassword(data: ResetPasswordData) {
    return this.repo.resetPassword(data)
  }
}

export const authService = new AuthService()
