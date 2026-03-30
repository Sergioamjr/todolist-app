import { db } from '../../db'
import type { CategoryModel } from '../../entities'

export interface ICategoryRepository {
  findAll(userId: string): Promise<CategoryModel[]>
  create(userId: string, data: Partial<CategoryModel>): Promise<CategoryModel>
  update(id: number, userId: string, data: Partial<CategoryModel>): Promise<CategoryModel | null>
  remove(id: number, userId: string): Promise<{ deleted: true } | null>
}

export class TypeORMCategoryRepository implements ICategoryRepository {
  async findAll(_userId: string) {
    const result = await db.execute('SELECT * FROM category')
    return result.rows as unknown as CategoryModel[]
  }

  async findOne(id: number, userId: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM category WHERE id = ? AND userId = ?',
      args: [id, userId],
    })
    return (result.rows[0] ?? null) as unknown as CategoryModel | null
  }

  async create(userId: string, data: Partial<CategoryModel>) {
    const result = await db.execute({
      sql: 'INSERT INTO category (name, userId) VALUES (?, ?)',
      args: [data.name ?? '', userId],
    })
    return this.findOne(Number(result.lastInsertRowid), userId) as Promise<CategoryModel>
  }

  async update(id: number, userId: string, data: Partial<CategoryModel>) {
    const category = await this.findOne(id, userId)
    if (!category) return null
    await db.execute({
      sql: 'UPDATE category SET name = ? WHERE id = ? AND userId = ?',
      args: [data.name ?? category.name, id, userId],
    })
    return this.findOne(id, userId)
  }

  async remove(id: number, userId: string) {
    const category = await this.findOne(id, userId)
    if (!category) return null
    await db.execute({
      sql: 'DELETE FROM category WHERE id = ? AND userId = ?',
      args: [id, userId],
    })
    return { deleted: true as const }
  }
}
