import {
  LibsqlItemRepository,
  type IItemRepository,
  type ItemFilters,
} from "./repository.js";
import type { Item } from "../../entities/item.entity.js";

export class ItemService {
  constructor(
    private readonly repo: IItemRepository = new LibsqlItemRepository(),
  ) {}

  findAll(userId: string, filters?: ItemFilters) {
    return this.repo.findAll(userId, filters);
  }

  findOne(id: number, userId: string) {
    return this.repo.findOne(id, userId);
  }

  create(userId: string, data: Partial<Item>) {
    return this.repo.create(userId, data);
  }

  update(id: number, userId: string, data: Partial<Item>) {
    return this.repo.update(id, userId, data);
  }

  remove(id: number, userId: string) {
    return this.repo.remove(id, userId);
  }
}

export const itemService = new ItemService();
