export interface JwtPayload {
  sub: number;
  username: string;
}

export interface AuthUser {
  id: number;
  username: string;
  isAuthenticated: boolean;
}
