import { t } from "elysia";

export const ItemBody = t.Object({
  name: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
  tags: t.Optional(t.String()),
  priority: t.Optional(t.Number({ minimum: 1, maximum: 5, default: 3 })),
  completed: t.Optional(t.Boolean({ default: false })),
  featured: t.Optional(t.Boolean({ default: false })),
});

export const ItemParams = t.Object({
  id: t.String(),
});

export const ItemQuery = t.Object({
  completed: t.Optional(t.String()),
  priority: t.Optional(t.String()),
  tags: t.Optional(t.String()),
  featured: t.Optional(t.String()),
  createdAtFrom: t.Optional(t.String()),
  createdAtTo: t.Optional(t.String()),
});
