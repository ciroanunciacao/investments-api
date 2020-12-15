export interface AuthUser {
  uid: string
  name: string
  profilePicture: string
  email: string
}

export interface AuthService {
  validateToken(token: string): Promise<object>
  getUserInfo(token: string): Promise<AuthUser>
}
