import { TypeORMUserRepository, type IUserRepository } from './repository'

export class UserService {
  constructor(private readonly repo: IUserRepository = new TypeORMUserRepository()) {}

  findById(id: string) {
    return this.repo.findById(id)
  }

  update(id: string, data: { name?: string; image?: string }) {
    return this.repo.update(id, data)
  }
}

export const userService = new UserService()
