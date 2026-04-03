import { t } from 'elysia'

export const UpdateUserBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  image: t.Optional(t.String()),
})
