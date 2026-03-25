import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { initDb } from './db'
import { auth } from './modules/auth'
import { itemsModule } from './modules/items'
import { categoriesModule } from './modules/categories'

await initDb()

const app = new Elysia()
  .use(swagger())
  .use(cors({ origin: 'http://localhost:3000', credentials: true }))
  // .mount(auth.handler)
  .use(itemsModule)
  .use(categoriesModule)
  .get('/', () => ({ message: 'Hello World' }))
  .listen(3001)

console.log(`API running at http://localhost:${app.server?.port}`)
