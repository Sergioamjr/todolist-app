import { app } from '../src/app'
import { initDb } from '../src/db'

let ready = false
const ensureReady = async () => {
  if (!ready) {
    await initDb()
    ready = true
  }
}

export default async function handler(request: Request) {
  await ensureReady()
  return app.fetch(request)
}
