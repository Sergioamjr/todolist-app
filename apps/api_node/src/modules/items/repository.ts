import { db } from "../../db.js";
import type { InValue } from "@libsql/client";
import type { Item } from "../../entities/item.entity.js";

export interface ItemFilters {
  completed?: boolean;
  priority?: number;
  tags?: string;
  featured?: boolean;
  createdAt?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

export interface IItemRepository {
  findAll(userId: string, filters?: ItemFilters): Promise<Item[]>;
  findOne(id: number, userId: string): Promise<Item | null>;
  create(userId: string, data: Partial<Item>): Promise<Item>;
  update(id: number, userId: string, data: Partial<Item>): Promise<Item | null>;
  remove(id: number, userId: string): Promise<{ deleted: true } | null>;
}

function toItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string | null,
    tags: row.tags as string | null,
    priority: row.priority as number,
    completed: Boolean(row.completed),
    featured: Boolean(row.featured),
    userId: row.userId as string,
    createdAt: new Date(row.createdAt as string),
  };
}

export class LibsqlItemRepository implements IItemRepository {
  async findAll(userId: string, filters: ItemFilters = {}) {
    const conditions = ["item.userId = ?"];
    const args: InValue[] = [userId];

    console.log("findAll>>>", { args });

    if (filters.completed !== undefined) {
      conditions.push("item.completed = ?");
      args.push(filters.completed ? 1 : 0);
    }
    if (filters.priority !== undefined) {
      conditions.push("item.priority = ?");
      args.push(filters.priority);
    }
    if (filters.tags !== undefined) {
      conditions.push("item.tags LIKE ?");
      args.push(`%${filters.tags}%`);
    }
    if (filters.featured !== undefined) {
      conditions.push("item.featured = ?");
      args.push(filters.featured ? 1 : 0);
    }
    if (filters.createdAt !== undefined) {
      const dateStr = filters.createdAt.substring(0, 10);
      conditions.push("item.createdAt >= ? AND item.createdAt < date(?, '+1 day')")
      args.push(dateStr, dateStr);
    }
    if (filters.createdAtFrom !== undefined) {
      conditions.push("item.createdAt >= ?");
      args.push(filters.createdAtFrom);
    }
    if (filters.createdAtTo !== undefined) {
      conditions.push("item.createdAt <= ?");
      args.push(filters.createdAtTo);
    }

    console.log("args", args);
    const result = await db.execute({
      sql: `SELECT * FROM item WHERE ${conditions.join(" AND ")} ORDER BY createdAt DESC`,
      args,
    });
    return result.rows.map((r) =>
      toItem(r as unknown as Record<string, unknown>),
    );
  }

  async findOne(id: number, userId: string) {
    const result = await db.execute({
      sql: "SELECT * FROM item WHERE id = ? AND userId = ? LIMIT 1",
      args: [id, userId],
    });
    if (result.rows.length === 0) return null;
    return toItem(result.rows[0] as unknown as Record<string, unknown>);
  }

  async create(userId: string, data: Partial<Item>) {
    const {
      name,
      description = null,
      tags = null,
      priority = 3,
      completed = false,
      featured = false,
    } = data;
    const result = await db.execute({
      sql: `INSERT INTO item (name, description, tags, priority, completed, featured, userId)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name!,
        description,
        tags,
        priority,
        completed ? 1 : 0,
        featured ? 1 : 0,
        userId,
      ],
    });
    return this.findOne(
      Number(result.lastInsertRowid),
      userId,
    ) as Promise<Item>;
  }

  async update(id: number, userId: string, data: Partial<Item>) {
    const item = await this.findOne(id, userId);
    if (!item) return null;

    const updated = { ...item, ...data };
    await db.execute({
      sql: `UPDATE item SET name = ?, description = ?, tags = ?, priority = ?, completed = ?, featured = ?
            WHERE id = ? AND userId = ?`,
      args: [
        updated.name,
        updated.description,
        updated.tags,
        updated.priority,
        updated.completed ? 1 : 0,
        updated.featured ? 1 : 0,
        id,
        userId,
      ],
    });
    return this.findOne(id, userId) as Promise<Item>;
  }

  async remove(id: number, userId: string) {
    const item = await this.findOne(id, userId);
    if (!item) return null;
    await db.execute({
      sql: "DELETE FROM item WHERE id = ? AND userId = ?",
      args: [id, userId],
    });
    return { deleted: true as const };
  }
}
