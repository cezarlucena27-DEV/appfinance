import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OnlineTracker } from '../../modules/admin/online-tracker.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private readonly onlineTracker: OnlineTracker) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request?.user?.id) {
      this.onlineTracker.ping(request.user.id);
    }
    return next.handle();
  }
}
