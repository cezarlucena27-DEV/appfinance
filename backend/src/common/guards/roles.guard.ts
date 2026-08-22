import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Check platform_admin via globalRole
    if (requiredRoles.includes('platform_admin') && user.globalRole === 'platform_admin') {
      return true;
    }

    // Check workspace roles (master, admin, member)
    return requiredRoles.some((role) => user?.role === role || user?.globalRole === role);
  }
}
