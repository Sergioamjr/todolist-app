import { TypeORMItemRepository, type IItemRepository } from './repository'
import type { ItemModel } from '../../entities'

export class ItemService {
  constructor(private readonly repo: IItemRepository = new TypeORMItemRepository()) {}

  findAll(userId: string, categoryId?: number) {
    return this.repo.findAll(userId, categoryId)
  }

  findOne(id: number, userId: string) {
    return this.repo.findOne(id, userId)
  }

  create(userId: string, data: Partial<ItemModel>) {
    return this.repo.create(userId, data)
  }

  update(id: number, userId: string, data: Partial<ItemModel>) {
    return this.repo.update(id, userId, data)
  }

  remove(id: number, userId: string) {
    return this.repo.remove(id, userId)
  }

  toggle(id: number, userId: string, completed: boolean) {
    return this.repo.toggle(id, userId, completed)
  }
}

export const itemService = new ItemService()
