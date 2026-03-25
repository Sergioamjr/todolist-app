import Elysia from 'elysia'
import { authGuard } from '../auth'
import { ItemService } from './service'
import { ItemBody, ItemParams, ItemQuery, ToggleBody } from './model'

export const itemsModule = new Elysia({ prefix: '/items' })
  .use(authGuard)
  .get('/', ({ userId, query }) => ItemService.findAll(userId, query.categoryId), {
    query: ItemQuery,
  })
  .post('/', ({ userId, body }) => ItemService.create(userId, body), {
    body: ItemBody,
  })
  .put('/:id', ({ userId, params, body }) => ItemService.update(params.id, userId, body), {
    params: ItemParams,
    body: ItemBody,
  })
  .delete('/:id', ({ userId, params, error }) =>
    ItemService.remove(params.id, userId).then(r => r ?? error(404, 'Not found')), {
    params: ItemParams,
  })
  .patch('/:id/toggle', ({ userId, params, body }) =>
    ItemService.toggle(params.id, userId, body.completed).then(r => r ?? error(404, 'Not found')), {
    params: ItemParams,
    body: ToggleBody,
  })
