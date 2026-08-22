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
exports.AdminPanelGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const admin_panel_decorator_1 = require("../decorators/admin-panel.decorator");
const admin_service_1 = require("../../modules/admin/admin.service");
let AdminPanelGuard = class AdminPanelGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPanel = this.reflector.getAllAndOverride(admin_panel_decorator_1.ADMIN_PANEL_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPanel) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user)
            return false;
        if (user.email === admin_service_1.SUPER_ADMIN_EMAIL)
            return true;
        if (requiredPanel === 'admins') {
            throw new common_1.ForbiddenException('Apenas o super admin pode gerenciar administradores');
        }
        if (user.adminPanels === 'all')
            return true;
        let panels = [];
        try {
            panels = JSON.parse(user.adminPanels || '[]');
        }
        catch { }
        if (panels.includes(requiredPanel))
            return true;
        throw new common_1.ForbiddenException('Acesso negado a este painel');
    }
};
exports.AdminPanelGuard = AdminPanelGuard;
exports.AdminPanelGuard = AdminPanelGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], AdminPanelGuard);
//# sourceMappingURL=admin-panel.guard.js.map