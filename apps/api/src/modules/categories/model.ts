import { t } from 'elysia'

export const CategoryBody = t.Object({
  name: t.String({ minLength: 1 }),
})

export const CategoryParams = t.Object({
  id: t.Numeric(),
})
