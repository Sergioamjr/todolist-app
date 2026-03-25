import { db, AppDataSource } from '../../db'
import { Item } from '../../entities'
import type { ItemModel } from '../../entities'

export interface IItemRepository {
  findAll(userId: string, categoryId?: number): Promise<ItemModel[]>
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

  async findAll(_userId: string, categoryId?: number) {
    if (categoryId !== undefined) {
      return db.query('SELECT * FROM item WHERE categoryId = ?').all(categoryId) as ItemModel[]
    }
    return db.query('SELECT * FROM item').all() as ItemModel[]
  }

  async findOne(id: number, userId: string) {
    return db.query('SELECT * FROM item WHERE id = ? AND userId = ?').get(id, userId) as ItemModel | null
  }

  async create(userId: string, data: Partial<ItemModel>) {
    return this.repo.save({ ...data, userId })
  }

  async update(id: number, userId: string, data: Partial<ItemModel>) {
    const item = await this.findOne(id, userId)
    if (!item) return null
    return this.repo.save({ ...item, ...data })
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
    return this.repo.save({ ...item, completed })
  }
}
