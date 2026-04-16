import { app } from './app'
import { initDb } from './db'

const port = Number(process.env.PORT) || 3001

initDb()
  .then(() => {
    app.listen(port)
    console.log(`API running at http://localhost:${port}`)
  })
  .catch(console.error)

export default app
