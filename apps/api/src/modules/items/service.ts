import { AppDataSource } from '../../db'
import { Item } from '../../entities'
import type { ItemModel } from '../../entities'

const repo = () => AppDataSource.getRepository(Item)

export abstract class ItemService {
  static async findAll(userId: string, categoryId?: number) {
    const qb = repo()
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId })

    if (categoryId !== undefined) {
      qb.andWhere('item.categoryId = :categoryId', { categoryId })
    }

    return qb.getMany()
  }

  static async findOne(id: number, userId: string) {
    return repo().findOneBy({ id, userId })
  }

  static async create(userId: string, data: Partial<ItemModel>) {
    return repo().save({ ...data, userId })
  }

  static async update(id: number, userId: string, data: Partial<ItemModel>) {
    const item = await repo().findOneBy({ id, userId })
    if (!item) return null
    return repo().save({ ...item, ...data })
  }

  static async remove(id: number, userId: string) {
    const item = await repo().findOneBy({ id, userId })
    if (!item) return null
    await repo().remove(item)
    return { deleted: true }
  }

  static async toggle(id: number, userId: string, completed: boolean) {
    const item = await repo().findOneBy({ id, userId })
    if (!item) return null
    return repo().save({ ...item, completed })
  }
}
