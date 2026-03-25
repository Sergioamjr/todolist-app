import Elysia, { NotFoundError } from 'elysia'
import { itemService } from './service'
import { ItemBody, ItemParams, ItemQuery, ToggleBody } from './model'

const orNotFound = <T>(r: T | null) => {
  if (!r) throw new NotFoundError()
  return r
}

export const itemsModule = new Elysia({ prefix: '/items' })
  .derive(() => ({ userId: 'user-dev' }))
  .get('/', ({ userId, query }) => itemService.findAll(userId, query.categoryId), {
    query: ItemQuery,
  })
  .post('/', ({ userId, body }) => itemService.create(userId, body), {
    body: ItemBody,
  })
  .put('/:id', ({ userId, params, body }) => itemService.update(params.id, userId, body), {
    params: ItemParams,
    body: ItemBody,
  })
  .delete('/:id', ({ userId, params }) =>
    itemService.remove(params.id, userId).then(orNotFound), {
    params: ItemParams,
  })
  .patch('/:id/toggle', ({ userId, params, body }) =>
    itemService.toggle(params.id, userId, body.completed).then(orNotFound), {
    params: ItemParams,
    body: ToggleBody,
  })
