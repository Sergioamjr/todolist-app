import { itemService } from "./service.js";
import { type InferContext, NotFoundError } from "elysia";
import { authGuard } from "../auth/index.js";
import type { Item } from "../../entities/item.entity.js";

const plain = <T extends object>(v: T): T => JSON.parse(JSON.stringify(v));

const orNotFound = <T>(r: T | null) => {
  if (!r) throw new NotFoundError();
  return plain(r as object) as T;
};

export type GuardedContext = Omit<
  InferContext<typeof authGuard>,
  "body" | "params"
> & {
  userId: string;
  body: Partial<Item>;
  params: { id: string };
};

class ItemsController {
  async delete(ctx: GuardedContext) {
    return itemService
      .remove(Number(ctx.params.id), ctx.userId)
      .then(orNotFound);
  }
  async update(ctx: GuardedContext) {
    return itemService
      .update(Number(ctx.params.id), ctx.userId, ctx.body)
      .then(orNotFound);
  }
  async create(ctx: GuardedContext) {
    const item = await itemService.create(ctx.userId as string, ctx.body);
    return plain(item);
  }

  async get(ctx: GuardedContext) {
    const filters = this.getFilters(ctx);
    const items = await itemService.findAll(ctx.userId, filters);
    return items.map(plain);
  }

  getFilters({ query }: Pick<GuardedContext, "query">) {
    const {
      completed,
      featured,
      priority,
      tags,
      createdAt,
      createdAtFrom,
      createdAtTo,
    } = query;
    return {
      ...(tags !== undefined && { tags }),
      ...(priority !== undefined && { priority: Number(priority) }),
      ...(completed !== undefined && { completed: completed === "true" }),
      ...(featured !== undefined && { featured: featured === "true" }),
      ...(createdAt !== undefined && { createdAt }),
      ...(createdAtFrom !== undefined && { createdAtFrom }),
      ...(createdAtTo !== undefined && { createdAtTo }),
    };
  }
}

export default new ItemsController();
