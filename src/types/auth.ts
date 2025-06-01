export type UserRole = 'fan' | 'artist' | 'merchant' | 'admin'

export interface User {
  id: string
  username: string
  role: UserRole
}