import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { initDb } from './db'
// import { auth } from './modules/auth'
import { itemsModule } from './modules/items'
import { categoriesModule } from './modules/categories'

const app = new Elysia()
  .use(swagger())
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get('origin')
        const expected = process.env.UI_URL?.replace(/\/$/, '') // Remove trailing slash if present

        console.log('cors', { origin, expected })

        if (origin === expected) return true

        // Optional: Allow localhost for development
        if (origin?.startsWith('http://localhost:')) return true

        return false
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'], // Good practice to be explicit
    })
  )
  // .mount(auth.handler)
  .use(itemsModule)
  .use(categoriesModule)
  .get('/', () => ({ message: 'Hello World' }))

if (process.env.NODE_ENV !== 'production') {
  initDb().then(() => {
    app.listen(3001)
    console.log(`API running at http://localhost:${app.server?.port}`)
  })
} else {
  initDb().catch(console.error)
}

export default app
