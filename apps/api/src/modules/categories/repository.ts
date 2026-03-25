import { db, AppDataSource } from '../../db'
import { Category } from '../../entities'
import type { CategoryModel } from '../../entities'

export interface ICategoryRepository {
  findAll(userId: string): Promise<CategoryModel[]>
  create(userId: string, data: Partial<CategoryModel>): Promise<CategoryModel>
  update(id: number, userId: string, data: Partial<CategoryModel>): Promise<CategoryModel | null>
  remove(id: number, userId: string): Promise<{ deleted: true } | null>
}

export class TypeORMCategoryRepository implements ICategoryRepository {
  private get repo() {
    return AppDataSource.getRepository(Category)
  }

  async findAll(_userId: string) {
    return db.query('SELECT * FROM category').all() as CategoryModel[]
  }

  async findOne(id: number, userId: string) {
    return db.query('SELECT * FROM category WHERE id = ? AND userId = ?').get(id, userId) as CategoryModel | null
  }

  async create(userId: string, data: Partial<CategoryModel>) {
    return this.repo.save({ ...data, userId })
  }

  async update(id: number, userId: string, data: Partial<CategoryModel>) {
    const category = await this.findOne(id, userId)
    if (!category) return null
    return this.repo.save({ ...category, ...data })
  }

  async remove(id: number, userId: string) {
    const category = await this.findOne(id, userId)
    if (!category) return null
    await this.repo.remove(category)
    return { deleted: true as const }
  }
}
