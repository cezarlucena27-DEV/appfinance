import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_PANEL_KEY } from '../decorators/admin-panel.decorator';
import { SUPER_ADMIN_EMAIL } from '../../modules/admin/admin.service';

@Injectable()
export class AdminPanelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPanel = this.reflector.getAllAndOverride<string>(ADMIN_PANEL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPanel) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    if (user.email === SUPER_ADMIN_EMAIL) return true;

    if (requiredPanel === 'admins') {
      throw new ForbiddenException('Apenas o super admin pode gerenciar administradores');
    }

    if (user.adminPanels === 'all') return true;

    let panels: string[] = [];
    try {
      panels = JSON.parse(user.adminPanels || '[]');
    } catch {}

    if (panels.includes(requiredPanel)) return true;

    throw new ForbiddenException('Acesso negado a este painel');
  }
}