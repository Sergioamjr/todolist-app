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
