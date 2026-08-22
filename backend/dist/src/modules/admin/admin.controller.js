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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const audit_service_1 = require("./audit.service");
const admin_dto_1 = require("./dto/admin.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const admin_panel_guard_1 = require("../../common/guards/admin-panel.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_panel_decorator_1 = require("../../common/decorators/admin-panel.decorator");
let AdminController = class AdminController {
    constructor(adminService, auditService) {
        this.adminService = adminService;
        this.auditService = auditService;
    }
    login(dto) { return this.adminService.login(dto.key); }
    async verify(auth) {
        const token = auth?.replace('Bearer ', '');
        return this.adminService.verify(token || '');
    }
    getStats() { return this.adminService.getStats(); }
    getOnlineUsers() { return this.adminService.getOnlineUsers(); }
    getMonthlyBalances(userId, startDate, endDate) {
        return this.adminService.getMonthlyBalances(userId, startDate, endDate);
    }
    getUsers() { return this.adminService.getUsers(); }
    getUserSummary(userId) { return this.adminService.getUserSummary(userId); }
    getUserDetail(userId) { return this.adminService.getUserDetail(userId); }
    updateUser(userId, body) {
        return this.adminService.updateUser(userId, body);
    }
    updateUserRole(userId, role) {
        return this.adminService.updateUserRole(userId, role);
    }
    toggleUserActive(userId, body) {
        return this.adminService.toggleUserActive(userId, body?.message);
    }
    resetUserPassword(userId) { return this.adminService.resetUserPassword(userId); }
    deleteUser(userId) { return this.adminService.deleteUser(userId); }
    getPendingAdmins() { return this.adminService.getPendingAdmins(); }
    getApprovedAdmins() { return this.adminService.getApprovedAdmins(); }
    createAdmin(body, req) {
        return this.adminService.createAdmin(body, req.user.email);
    }
    updateAdminPanels(userId, body, req) {
        return this.adminService.updateAdminPanels(userId, body.panels || [], req.user.email);
    }
    approveAdmin(userId, req) {
        return this.adminService.approveAdmin(userId, req.user.email);
    }
    rejectAdmin(userId) {
        return this.adminService.rejectAdmin(userId);
    }
    revokeAdmin(userId) {
        return this.adminService.revokeAdmin(userId);
    }
    getAuditLogs(userId, entity, action, page, limit) {
        return this.auditService.findAll(userId, entity, action, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
    }
    getAuditStats() { return this.auditService.getStats(); }
    getMonthlyReport(userId, month, year) {
        return this.adminService.getMonthlyReport(userId, month ? parseInt(month) : new Date().getMonth() + 1, year ? parseInt(year) : new Date().getFullYear());
    }
    getAllTransactions(userId, month, year) {
        return this.adminService.getAllTransactions(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    }
    getAllAccounts(userId) { return this.adminService.getAllAccounts(userId); }
    getAllCards(userId) { return this.adminService.getAllCards(userId); }
    getAllBudgets(userId, month, year) {
        return this.adminService.getAllBudgets(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    }
    getAllGoals(userId) { return this.adminService.getAllGoals(userId); }
    getAllCategories(userId) { return this.adminService.getAllCategories(userId); }
    getAsaasConfig() { return this.adminService.getAsaasConfig(); }
    updateAsaasConfig(body) {
        return this.adminService.updateAsaasConfig(body);
    }
    getWorkspaces() { return this.adminService.getWorkspaces(); }
    getSubscriptionsFinance() { return this.adminService.getSubscriptionsFinance(); }
    getReminderViews() { return this.adminService.getReminderViews(); }
    blockUser(userId, body, req) {
        return this.adminService.blockUserForPayment(userId, body?.reason, req.user?.email);
    }
    unblockUser(userId, body, req) {
        return this.adminService.unblockUserForPayment(userId, body?.accessUntil, req.user?.email);
    }
    registerPayment(userId, body, req) {
        return this.adminService.registerPayment(userId, body, req.user?.email);
    }
    getAllTransactionsExport(userId, month, year, type) {
        return this.adminService.getAllTransactionsExport(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined, type);
    }
    async exportExcel(res, userId, month, year) {
        const buffer = await this.adminService.exportExcel(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=financeapp-admin-${new Date().toISOString().slice(0, 10)}.xlsx`);
        res.send(buffer);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.AdminLoginDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verify", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('overview'),
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('overview'),
    (0, common_1.Get)('online'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getOnlineUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('overview'),
    (0, common_1.Get)('monthly-balances'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMonthlyBalances", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Get)('user-summary'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserSummary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Get)('user-detail'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Put)('users/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Put)('users/:userId/role'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Put)('users/:userId/toggle-active'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleUserActive", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Post)('users/:userId/reset-password'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "resetUserPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('users'),
    (0, common_1.Delete)('users/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('admins'),
    (0, common_1.Get)('pending-admins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPendingAdmins", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('admins'),
    (0, common_1.Get)('approved-admins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getApprovedAdmins", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('admins'),
    (0, common_1.Post)('admins'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('admins'),
    (0, common_1.Put)('admins/:userId/panels'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateAdminPanels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('admins'),
    (0, common_1.Post)('approve-admin/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('admins'),
    (0, common_1.Post)('reject-admin/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('admins'),
    (0, common_1.Post)('revoke-admin/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "revokeAdmin", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('logs'),
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('logs'),
    (0, common_1.Get)('audit-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('report'),
    (0, common_1.Get)('report'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMonthlyReport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('transactions'),
    (0, common_1.Get)('all-transactions'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('accounts'),
    (0, common_1.Get)('all-accounts'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllAccounts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('cards'),
    (0, common_1.Get)('all-cards'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllCards", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('budgets'),
    (0, common_1.Get)('all-budgets'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllBudgets", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('goals'),
    (0, common_1.Get)('all-goals'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllGoals", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('categories'),
    (0, common_1.Get)('all-categories'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('configs'),
    (0, common_1.Get)('asaas-config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAsaasConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('configs'),
    (0, common_1.Put)('asaas-config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateAsaasConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, admin_panel_decorator_1.AdminPanel)('configs'),
    (0, common_1.Get)('workspaces'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getWorkspaces", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, common_1.Get)('subscriptions-finance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubscriptionsFinance", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, common_1.Get)('reminder-views'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getReminderViews", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, common_1.Post)('subscriptions-finance/:userId/block'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "blockUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, common_1.Post)('subscriptions-finance/:userId/unblock'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, common_1.Post)('subscriptions-finance/:userId/payments'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "registerPayment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('transactions'),
    (0, common_1.Get)('all-transactions-export'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllTransactionsExport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, admin_panel_guard_1.AdminPanelGuard),
    (0, roles_decorator_1.Roles)('platform_admin', 'master'),
    (0, admin_panel_decorator_1.AdminPanel)('overview'),
    (0, common_1.Get)('export-excel'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportExcel", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService, audit_service_1.AuditService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map