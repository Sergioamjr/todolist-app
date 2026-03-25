import Elysia, { NotFoundError } from 'elysia'
import { categoryService } from './service'
import { CategoryBody, CategoryParams } from './model'

const orNotFound = <T>(r: T | null) => {
  if (!r) throw new NotFoundError()
  return r
}

export const categoriesModule = new Elysia({ prefix: '/categories' })
  .derive(() => ({ userId: 'user-dev' }))
  .get('/', ({ userId }) => categoryService.findAll(userId))
  .post('/', ({ userId, body }) => categoryService.create(userId, body), {
    body: CategoryBody,
  })
  .put('/:id', ({ userId, params, body }) => categoryService.update(params.id, userId, body), {
    params: CategoryParams,
    body: CategoryBody,
  })
  .delete('/:id', ({ userId, params }) =>
    categoryService.remove(params.id, userId).then(orNotFound), {
    params: CategoryParams,
  })
