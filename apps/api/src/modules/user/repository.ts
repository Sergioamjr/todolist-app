import { db } from '../../db'

export interface UserModel {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface IUserRepository {
  findById(id: string): Promise<UserModel | null>
  update(id: string, data: Partial<Pick<UserModel, 'name' | 'image'>>): Promise<UserModel | null>
}

export class TypeORMUserRepository implements IUserRepository {
  async findById(id: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM user WHERE id = ?',
      args: [id],
    })
    return (result.rows[0] ?? null) as unknown as UserModel | null
  }

  async update(id: string, data: Partial<Pick<UserModel, 'name' | 'image'>>) {
    const user = await this.findById(id)
    if (!user) return null
    await db.execute({
      sql: 'UPDATE user SET name = ?, image = ?, updatedAt = ? WHERE id = ?',
      args: [data.name ?? user.name, data.image ?? user.image ?? null, new Date().toISOString(), id],
    })
    return this.findById(id)
  }
}
