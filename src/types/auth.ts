export type UserRole = 'user' | 'artist' | 'merchant' | 'admin'

export interface User {
  id: string
  username: string
  role: UserRole
}