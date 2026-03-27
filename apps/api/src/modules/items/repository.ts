import { db, AppDataSource } from '../../db'
import { Item } from '../../entities'
import type { ItemModel } from '../../entities'

export interface ItemFilters {
  categoryId?: number
  completed?: boolean
  score?: number
  name?: string
  deadline?: string
  createdAtFrom?: string
  createdAtTo?: string
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
  private get repo() {
    return AppDataSource.getRepository(Item)
  }

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

    if (filters.createdAtFrom !== undefined) {
      conditions.push('createdAt >= ?')
      params.push(filters.createdAtFrom)
    }
    // if (filters.createdAtTo !== undefined) {
    //   conditions.push('createdAt <= ?')
    //   params.push(filters.createdAtTo)
    // }

    const where = conditions.join(' AND ')
    return db
      .query(`SELECT * FROM item WHERE ${where}`)
      .all(...(params as unknown[] as any)) as ItemModel[]
  }

  async findOne(id: number, userId: string) {
    return db
      .query('SELECT * FROM item WHERE id = ? AND userId = ?')
      .get(id, userId) as ItemModel | null
  }

  async create(userId: string, data: Partial<ItemModel>) {
    return this.repo.save({ ...data, userId })
  }

  async update(id: number, userId: string, data: Partial<ItemModel>) {
    const item = await this.findOne(id, userId)
    if (!item) return null
    await this.repo.update({ id }, { ...item, ...data })
    return this.findOne(id, userId)
  }

  async remove(id: number, userId: string) {
    const item = await this.findOne(id, userId)
    if (!item) return null
    await this.repo.remove(item)
    return { deleted: true as const }
  }

  async toggle(id: number, userId: string, completed: boolean) {
    const item = await this.findOne(id, userId)
    if (!item) return null
    await this.repo.update({ id }, { ...item, completed })
    return this.findOne(id, userId)
  }
}
