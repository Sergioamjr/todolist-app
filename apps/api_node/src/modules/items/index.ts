import Elysia from 'elysia'
import { authGuard } from '../auth/index.js'
import { itemsRoutes } from './routes.js'

export { itemsRoutes }
export const itemsModule = new Elysia().use(authGuard).use(itemsRoutes)
