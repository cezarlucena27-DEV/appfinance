import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_PANEL_KEY } from '../decorators/admin-panel.decorator';
import { isSuperAdmin } from '../security.config';

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
    if (!user || !user.id) return false;

    if (user.globalRole !== 'platform_admin' || user.isAdminApproved !== true) {
      throw new ForbiddenException('Acesso restrito a administradores da plataforma');
    }

    if (isSuperAdmin(user.email)) return true;

    if (requiredPanel === 'admins') {
      throw new ForbiddenException('Apenas o super admin pode gerenciar administradores');
    }

    if (user.adminPanels === 'all') return true;

    let panels: string[] = [];
    try {
      const parsed = JSON.parse(user.adminPanels || '[]');
      if (Array.isArray(parsed)) panels = parsed.filter((panel) => typeof panel === 'string');
    } catch {
      panels = [];
    }

    if (panels.includes(requiredPanel)) return true;

    throw new ForbiddenException('Acesso negado a este painel');
  }
}
