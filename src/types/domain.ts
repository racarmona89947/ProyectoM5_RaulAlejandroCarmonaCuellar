import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'customer' | 'admin'

export interface Category {
  id: string
  name: string
  slug: string
  active: boolean
  createdAt: Timestamp
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Timestamp
}

export interface Product {
  id: string
  name: string
  brand: string
  description: string
  category: string
  price: number
  previousPrice?: number
  stock: number
  images: string[]
  featured: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

export type OrderItem = CartItem

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En preparación',
  shipped: 'Enviado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}