export interface Item {
  id: number
  name: string
  description: string | null
  tags: string | null
  priority: number
  completed: boolean
  featured: boolean
  userId: string
  createdAt: Date
}
