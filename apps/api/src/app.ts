import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { auth, authModule } from './modules/auth'
import { itemsModule } from './modules/items'
import { categoriesModule } from './modules/categories'
import { userModule } from './modules/user'
import { initDb } from './db'

export const app = new Elysia({ adapter: node() })
  .use(swagger())
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get('origin')
        const expected = process.env.UI_URL?.replace(/\/$/, '')

        console.log('cors', { origin, expected })

        if (origin === expected || expected === '*') return true
        if (origin?.startsWith('http://localhost:')) return true

        return false
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .mount(auth.handler)
  .use(authModule)
  .use(itemsModule)
  .use(categoriesModule)
  .use(userModule)
  .get('/', () => ({ message: 'Hello World' }))

// Vercel serverless: export a Node.js handler with lazy DB initialization
let ready = false
const ensureReady = async () => {
  if (!ready) {
    await initDb()
    ready = true
  }
}

export default async function handler(req: Parameters<typeof app.handle>[0], res: Parameters<typeof app.handle>[1]) {
  await ensureReady()
  return app.handle(req, res)
}
