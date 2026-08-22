"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const audit_service_1 = require("../../modules/admin/audit.service");
const ENTITY_MAP = {
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
const METHOD_MAP = {
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete',
};
let AuditInterceptor = class AuditInterceptor {
    constructor(auditService) {
        this.auditService = auditService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user, ip, headers } = request;
        if (method === 'GET')
            return next.handle();
        const action = METHOD_MAP[method];
        if (!action)
            return next.handle();
        const entity = Object.entries(ENTITY_MAP).find(([path]) => url.startsWith(path))?.[1];
        if (!entity)
            return next.handle();
        const userId = user?.id;
        if (!userId)
            return next.handle();
        const userAgent = headers['user-agent'] || '';
        const clientIp = ip || headers['x-forwarded-for'] || '';
        return next.handle().pipe((0, rxjs_1.tap)(async (responseData) => {
            try {
                const entityId = responseData?.id || body?.id || 'unknown';
                const newValues = action === 'delete' ? null : body;
                await this.auditService.log(userId, action, entity, entityId, null, newValues, clientIp, userAgent);
            }
            catch { }
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map