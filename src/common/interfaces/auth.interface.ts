import { UserRole } from '../enums/permissions.enum';

export interface JwtPayload {
  sub: number;
  username: string;
  role: UserRole;
}

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  isAuthenticated: boolean;
}
