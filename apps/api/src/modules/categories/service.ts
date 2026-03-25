import { TypeORMCategoryRepository, type ICategoryRepository } from './repository'
import type { CategoryModel } from '../../entities'

export class CategoryService {
  constructor(private readonly repo: ICategoryRepository = new TypeORMCategoryRepository()) {}

  async findAll(userId: string) {
    return this.repo.findAll(userId)
  }

  create(userId: string, data: Partial<CategoryModel>) {
    return this.repo.create(userId, data)
  }

  update(id: number, userId: string, data: Partial<CategoryModel>) {
    return this.repo.update(id, userId, data)
  }

  remove(id: number, userId: string) {
    return this.repo.remove(id, userId)
  }
}

export const categoryService = new CategoryService()
