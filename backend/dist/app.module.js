"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const accounts_module_1 = require("./modules/accounts/accounts.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const categories_module_1 = require("./modules/categories/categories.module");
const cards_module_1 = require("./modules/cards/cards.module");
const budgets_module_1 = require("./modules/budgets/budgets.module");
const goals_module_1 = require("./modules/goals/goals.module");
const reports_module_1 = require("./modules/reports/reports.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const backups_module_1 = require("./modules/backups/backups.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            accounts_module_1.AccountsModule,
            transactions_module_1.TransactionsModule,
            categories_module_1.CategoriesModule,
            cards_module_1.CardsModule,
            budgets_module_1.BudgetsModule,
            goals_module_1.GoalsModule,
            reports_module_1.ReportsModule,
            subscriptions_module_1.SubscriptionsModule,
            backups_module_1.BackupsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map