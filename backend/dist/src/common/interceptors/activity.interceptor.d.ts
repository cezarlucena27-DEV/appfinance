import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OnlineTracker } from '../../modules/admin/online-tracker.service';
export declare class ActivityInterceptor implements NestInterceptor {
    private readonly onlineTracker;
    constructor(onlineTracker: OnlineTracker);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
