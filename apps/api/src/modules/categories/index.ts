import Elysia from 'elysia'
import { authGuard } from '../auth'
import { CategoryService } from './service'
import { CategoryBody, CategoryParams } from './model'

export const categoriesModule = new Elysia({ prefix: '/categories' })
  .use(authGuard)
  .get('/', ({ userId }) => CategoryService.findAll(userId))
  .post('/', ({ userId, body }) => CategoryService.create(userId, body), {
    body: CategoryBody,
  })
  .put('/:id', ({ userId, params, body }) => CategoryService.update(params.id, userId, body), {
    params: CategoryParams,
    body: CategoryBody,
  })
  .delete('/:id', ({ userId, params, error }) =>
    CategoryService.remove(params.id, userId).then(r => r ?? error(404, 'Not found')), {
    params: CategoryParams,
  })
