import request from 'supertest'
import { app } from '../app'

const TEST_PORT = 3099

beforeAll(async () => {
  await app.listen(TEST_PORT)
})

afterAll(async () => {
  try {
    await app.stop()
  } catch {
    // server may already be stopped
  }
})

describe('GET /', () => {
  it('returns hello world message', async () => {
    const res = await request(`http://localhost:${TEST_PORT}`).get('/')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Hello World' })
  })
})
