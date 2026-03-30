import { db } from '../../db'
import type { ItemModel } from '../../entities'
import type { InValue } from '@libsql/client'

export interface ItemFilters {
  categoryId?: number
  completed?: boolean
  score?: number
  name?: string
  deadline?: string
  forDate?: string
}

export interface IItemRepository {
  findAll(userId: string, filters?: ItemFilters): Promise<ItemModel[]>
  findOne(id: number, userId: string): Promise<ItemModel | null>
  create(userId: string, data: Partial<ItemModel>): Promise<ItemModel>
  update(id: number, userId: string, data: Partial<ItemModel>): Promise<ItemModel | null>
  remove(id: number, userId: string): Promise<{ deleted: true } | null>
  toggle(id: number, userId: string, completed: boolean): Promise<ItemModel | null>
}

export class TypeORMItemRepository implements IItemRepository {
  async findAll(userId: string, filters: ItemFilters = {}) {
    const conditions: string[] = ['userId = ?']
    const params: unknown[] = [userId]

    if (filters.categoryId !== undefined) {
      conditions.push('categoryId = ?')
      params.push(filters.categoryId)
    }
    if (filters.completed !== undefined) {
      conditions.push('completed = ?')
      params.push(filters.completed ? 1 : 0)
    }
    if (filters.score !== undefined) {
      conditions.push('score = ?')
      params.push(filters.score)
    }
    if (filters.name !== undefined) {
      conditions.push('name LIKE ?')
      params.push(`%${filters.name}%`)
    }
    if (filters.deadline !== undefined) {
      conditions.push('deadline = ?')
      params.push(filters.deadline)
    }
    if (filters.forDate !== undefined) {
      conditions.push('forDate = ?')
      params.push(filters.forDate.slice(0, 10))
    }

    const where = conditions.join(' AND ')
    const result = await db.execute({
      sql: `SELECT * FROM item WHERE ${where}`,
      args: params as InValue[],
    })
    return result.rows as unknown as ItemModel[]
  }

  async findOne(id: number, userId: string) {
    const result = await db.execute({
      sql: 'SELECT * FROM item WHERE id = ? AND userId = ?',
      args: [id, userId],
    })
    return (result.rows[0] ?? null) as unknown as ItemModel | null
  }

  async create(userId: string, data: Partial<ItemModel>) {
    const forDate = data.forDate ?? new Date().toISOString().slice(0, 10)
    const result = await db.execute({
      sql: `INSERT INTO item (name, description, score, completed, deadline, forDate, userId, categoryId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.name ?? '',
        data.description ?? null,
        data.score ?? 3,
        data.completed ? 1 : 0,
        data.deadline ?? null,
        forDate,
        userId,
        data.categoryId ?? null,
      ],
    })
    return this.findOne(Number(result.lastInsertRowid), userId) as Promise<ItemModel>
  }

  async update(id: number, userId: string, data: Partial<ItemModel>) {
    const item = await this.findOne(id, userId)
    if (!item) return null
    await db.execute({
      sql: `UPDATE item SET name = ?, description = ?, score = ?, deadline = ?, forDate = ?, categoryId = ? WHERE id = ? AND userId = ?`,
      args: [
        data.name ?? item.name,
        data.description ?? item.description ?? null,
        data.score ?? item.score,
        data.deadline ?? item.deadline ?? null,
        data.forDate ?? item.forDate,
        data.categoryId ?? item.categoryId ?? null,
        id,
        userId,
      ],
    })
    return this.findOne(id, userId)
  }

  async remove(id: number, userId: string) {
    const item = await this.findOne(id, userId)
    if (!item) return null
    await db.execute({ sql: 'DELETE FROM item WHERE id = ? AND userId = ?', args: [id, userId] })
    return { deleted: true as const }
  }

  async toggle(id: number, userId: string, completed: boolean) {
    const item = await this.findOne(id, userId)
    if (!item) return null
    await db.execute({
      sql: 'UPDATE item SET completed = ? WHERE id = ? AND userId = ?',
      args: [completed ? 1 : 0, id, userId],
    })
    return this.findOne(id, userId)
  }
}
