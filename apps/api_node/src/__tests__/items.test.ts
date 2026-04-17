import request from 'supertest'
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { db, initDb } from '../db.js'
import { itemsRoutes } from '../modules/items/routes.js'

const TEST_PORT = 3098
const TEST_USER_ID = 'test-user-id'

let testApp: Elysia<any, any, any, any, any, any, any>

beforeAll(async () => {
  await initDb()

  testApp = new Elysia({ adapter: node() })
    .derive({ as: 'global' }, () => ({ userId: TEST_USER_ID as string | undefined }))
    .use(itemsRoutes)

  await testApp.listen(TEST_PORT)
})

afterAll(async () => {
  try { await (testApp as any).stop() } catch {}
})

afterEach(async () => {
  await db.execute('DELETE FROM item')
})

const api = () => request(`http://localhost:${TEST_PORT}`)

describe('GET /items', () => {
  it('returns empty list when no items exist', async () => {
    const res = await api().get('/items')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns items belonging to the user', async () => {
    await api().post('/items').send({ name: 'My Task' })
    const res = await api().get('/items')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({ name: 'My Task', userId: TEST_USER_ID })
  })
})

describe('POST /items', () => {
  it('creates a new item with defaults', async () => {
    const res = await api().post('/items').send({ name: 'New Task' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      name: 'New Task',
      priority: 3,
      completed: false,
      featured: false,
      userId: TEST_USER_ID,
    })
    expect(res.body.id).toBeDefined()
  })

  it('creates item with all fields', async () => {
    const res = await api().post('/items').send({
      name: 'Full Task',
      description: '<p>rich text</p>',
      tags: 'work,urgent',
      priority: 5,
      completed: true,
      featured: true,
    })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      name: 'Full Task',
      description: '<p>rich text</p>',
      tags: 'work,urgent',
      priority: 5,
      completed: true,
      featured: true,
    })
  })

  it('returns 422 when name is missing', async () => {
    const res = await api().post('/items').send({ priority: 3 })
    expect(res.status).toBe(422)
  })
})

describe('PUT /items/:id', () => {
  it('updates an existing item', async () => {
    const created = await api().post('/items').send({ name: 'Original' })
    const id = created.body.id

    const res = await api().put(`/items/${id}`).send({
      name: 'Updated',
      priority: 5,
      completed: true,
      featured: true,
    })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ name: 'Updated', priority: 5, completed: true, featured: true })
  })

  it('returns 404 for non-existent item', async () => {
    const res = await api().put('/items/99999').send({ name: 'X' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /items/:id', () => {
  it('deletes an existing item', async () => {
    const created = await api().post('/items').send({ name: 'To Delete' })
    const id = created.body.id

    const res = await api().delete(`/items/${id}`)
    expect(res.status).toBe(200)

    const list = await api().get('/items')
    expect(list.body).toHaveLength(0)
  })

  it('returns 404 for non-existent item', async () => {
    const res = await api().delete('/items/99999')
    expect(res.status).toBe(404)
  })
})
