import { t } from 'elysia'

export const ItemBody = t.Object({
  name: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
  score: t.Optional(t.Number({ minimum: 1, maximum: 5, default: 3 })),
  deadline: t.Optional(t.String()),
  categoryId: t.Optional(t.Number()),
})

export const ToggleBody = t.Object({
  completed: t.Boolean(),
})

export const ItemParams = t.Object({
  id: t.Numeric(),
})

export const ItemQuery = t.Object({
  categoryId: t.Optional(t.Numeric()),
  completed: t.Optional(t.BooleanString()),
  score: t.Optional(t.Numeric()),
  name: t.Optional(t.String()),
  deadline: t.Optional(t.String()),
  createdAtFrom: t.Optional(t.String()),
  createdAtTo: t.Optional(t.String()),
})
