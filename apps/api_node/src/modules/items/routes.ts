import Elysia from "elysia";
import { ItemBody, ItemParams, ItemQuery } from "./model.js";
import ItemsController, { type GuardedContext } from "./controller.js";

export const itemsRoutes = new Elysia({ prefix: "/items" })
  .get("/", (ctx) => ItemsController.get(ctx as GuardedContext), {
    query: ItemQuery,
  })
  .post("/", (ctx) => ItemsController.create(ctx as GuardedContext), {
    body: ItemBody,
  })
  .put("/:id", (ctx) => ItemsController.update(ctx as GuardedContext), {
    params: ItemParams,
    body: ItemBody,
  })
  .delete("/:id", (ctx) => ItemsController.delete(ctx as GuardedContext), {
    params: ItemParams,
  });
