import Elysia, { NotFoundError } from "elysia";
import { itemService } from "./service.js";
import { ItemBody, ItemParams, ItemQuery } from "./model.js";

const plain = <T extends object>(v: T): T => JSON.parse(JSON.stringify(v));

const orNotFound = <T>(r: T | null) => {
  if (!r) throw new NotFoundError();
  return plain(r as object) as T;
};

// Pure routes — userId must be provided by parent context (authGuard or test mock)
export const itemsRoutes = new Elysia({ prefix: "/items" })
  .get(
    "/",
    async (ctx: any) => {
      const { completed, featured, priority, tags } = ctx.query;
      const filters = {
        ...(tags !== undefined && { tags }),
        ...(priority !== undefined && { priority: Number(priority) }),
        ...(completed !== undefined && { completed: completed === "true" }),
        ...(featured !== undefined && { featured: featured === "true" }),
      };
      const items = await itemService.findAll(ctx.userId, filters);
      return items.map(plain);
    },
    { query: ItemQuery },
  )
  .post(
    "/",
    async (ctx: any) => {
      const item = await itemService.create(ctx.userId, ctx.body);
      return plain(item);
    },
    { body: ItemBody },
  )
  .put(
    "/:id",
    async (ctx: any) =>
      itemService.update(Number(ctx.params.id), ctx.userId, ctx.body).then(orNotFound),
    { params: ItemParams, body: ItemBody },
  )
  .delete(
    "/:id",
    async (ctx: any) =>
      itemService.remove(Number(ctx.params.id), ctx.userId).then(orNotFound),
    { params: ItemParams },
  );
