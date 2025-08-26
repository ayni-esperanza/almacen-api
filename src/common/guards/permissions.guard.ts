import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, ROLE_PERMISSIONS } from '../enums/permissions.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user with role from database
    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isActive: true },
    });

    if (!userWithRole || !userWithRole.isActive) {
      throw new ForbiddenException('User not found or inactive');
    }

    // Get permissions for user role
    const userPermissions = ROLE_PERMISSIONS[userWithRole.role] || [];

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions to access this resource',
      );
    }

    // Add user role to request for controllers
    request.user.role = userWithRole.role;

    return true;
  }
}
