import { AppDataSource } from '../../db'
import { Category } from '../../entities'
import type { CategoryModel } from '../../entities'

const repo = () => AppDataSource.getRepository(Category)

export abstract class CategoryService {
  static async findAll(userId: string) {
    return repo().findBy({ userId })
  }

  static async create(userId: string, data: Partial<CategoryModel>) {
    return repo().save({ ...data, userId })
  }

  static async update(id: number, userId: string, data: Partial<CategoryModel>) {
    const category = await repo().findOneBy({ id, userId })
    if (!category) return null
    return repo().save({ ...category, ...data })
  }

  static async remove(id: number, userId: string) {
    const category = await repo().findOneBy({ id, userId })
    if (!category) return null
    await repo().remove(category)
    return { deleted: true }
  }
}
