import Elysia, { NotFoundError } from 'elysia'
import { authGuard } from '../auth'
import { userService } from './service'
import { UpdateUserBody } from './model'

export const userModule = new Elysia({ prefix: '/users' })
  .use(authGuard)
  .get('/me', ({ userId }) =>
    userService.findById(userId!).then((u) => {
      if (!u) throw new NotFoundError()
      return u
    })
  )
  .patch('/me', ({ userId, body }) =>
    userService.update(userId!, body).then((u) => {
      if (!u) throw new NotFoundError()
      return u
    }),
    { body: UpdateUserBody }
  )
