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
exports.PublicInfoController = exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const subscriptions_service_1 = require("./subscriptions.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    getCurrent(req) {
        return this.subscriptionsService.getCurrent(req.user.id);
    }
    getPlans() {
        return this.subscriptionsService.getPlans();
    }
    getPix(plan, req) {
        return this.subscriptionsService.getPix(req.user.id, plan);
    }
    getReminder(req) {
        return this.subscriptionsService.getReminder(req.user.id);
    }
    checkout(plan, billingDay, req) {
        return this.subscriptionsService.checkout(req.user.id, plan, billingDay);
    }
    cancel(req) {
        return this.subscriptionsService.cancel(req.user.id);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('pix'),
    __param(0, (0, common_1.Query)('plan')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getPix", null);
__decorate([
    (0, common_1.Get)('reminder'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getReminder", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)('plan')),
    __param(1, (0, common_1.Body)('billingDay')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('cancel'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "cancel", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
let PublicInfoController = class PublicInfoController {
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    getPaymentInfo() {
        return this.subscriptionsService.getPublicPaymentInfo();
    }
};
exports.PublicInfoController = PublicInfoController;
__decorate([
    (0, common_1.Get)('payment-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicInfoController.prototype, "getPaymentInfo", null);
exports.PublicInfoController = PublicInfoController = __decorate([
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], PublicInfoController);
//# sourceMappingURL=subscriptions.controller.js.map