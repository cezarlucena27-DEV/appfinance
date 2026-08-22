import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../modules/admin/audit.service';

const ENTITY_MAP: Record<string, string> = {
  '/api/transactions': 'transaction',
  '/api/accounts': 'account',
  '/api/cards': 'card',
  '/api/categories': 'category',
  '/api/budgets': 'budget',
  '/api/goals': 'goal',
  '/api/auth': 'auth',
  '/api/users': 'user',
  '/api/admin': 'admin',
};

const METHOD_MAP: Record<string, string> = {
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    if (method === 'GET') return next.handle();

    const action = METHOD_MAP[method];
    if (!action) return next.handle();

    const entity = Object.entries(ENTITY_MAP).find(([path]) => url.startsWith(path))?.[1];
    if (!entity) return next.handle();

    const userId = user?.id;
    if (!userId) return next.handle();

    const userAgent = headers['user-agent'] || '';
    const clientIp = ip || headers['x-forwarded-for'] || '';

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const entityId = responseData?.id || body?.id || 'unknown';
          const newValues = action === 'delete' ? null : body;

          await this.auditService.log(
            userId, action, entity, entityId,
            null, newValues, clientIp, userAgent,
          );
        } catch {}
      }),
    );
  }
}
