import { EntitySchema } from 'typeorm'

export interface CategoryModel {
  id: number
  name: string
  userId: string
  createdAt: Date
}

export interface ItemModel {
  id: number
  name: string
  description: string
  score: number
  completed: boolean
  deadline: string
  forDate: string
  userId: string
  categoryId: number
  category: CategoryModel
  createdAt: Date
}

export const Category = new EntitySchema<CategoryModel>({
  name: 'Category',
  tableName: 'category',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    userId: { type: String },
    createdAt: { type: Date, createDate: true },
  },
})

export const Item = new EntitySchema<ItemModel>({
  name: 'Item',
  tableName: 'item',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    description: { type: String, nullable: true },
    score: { type: Number, default: 3 },
    completed: { type: Boolean, default: false },
    deadline: { type: 'date', nullable: true },
    forDate: { type: 'date', nullable: false },
    userId: { type: String },
    categoryId: { type: Number, nullable: true },
    createdAt: { type: Date, createDate: true },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'Category',
      joinColumn: { name: 'categoryId' },
      nullable: true,
    },
  },
})
