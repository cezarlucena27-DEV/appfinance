import { Controller, Get, Post, Put, Delete, Body, UseGuards, Headers, Query, Param, Req, Res, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditService } from './audit.service';
import { AdminLoginDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminPanelGuard } from '../../common/guards/admin-panel.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminPanel } from '../../common/decorators/admin-panel.decorator';
import { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService, private auditService: AuditService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) { return this.adminService.login(dto.key); }

  @Get('me')
  async verify(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.adminService.verify(token || '');
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('overview')
  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('overview')
  @Get('online')
  getOnlineUsers() { return this.adminService.getOnlineUsers(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('overview')
  @Get('monthly-balances')
  getMonthlyBalances(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getMonthlyBalances(userId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('users')
  @Get('users')
  getUsers() { return this.adminService.getUsers(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('users')
  @Get('user-summary')
  getUserSummary(@Query('userId') userId: string) { return this.adminService.getUserSummary(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('users')
  @Get('user-detail')
  getUserDetail(@Query('userId') userId: string) { return this.adminService.getUserDetail(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('users')
  @Put('users/:userId')
  updateUser(@Param('userId') userId: string, @Body() body: { name?: string; email?: string; globalRole?: string; isActive?: boolean }) {
    return this.adminService.updateUser(userId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('users')
  @Put('users/:userId/role')
  updateUserRole(@Param('userId') userId: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(userId, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('users')
  @Put('users/:userId/toggle-active')
  toggleUserActive(@Param('userId') userId: string, @Body() body: { message?: string }) {
    return this.adminService.toggleUserActive(userId, body?.message);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('users')
  @Post('users/:userId/reset-password')
  resetUserPassword(@Param('userId') userId: string) { return this.adminService.resetUserPassword(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('users')
  @Delete('users/:userId')
  deleteUser(@Param('userId') userId: string) { return this.adminService.deleteUser(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Get('pending-admins')
  getPendingAdmins() { return this.adminService.getPendingAdmins(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Get('approved-admins')
  getApprovedAdmins() { return this.adminService.getApprovedAdmins(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Post('admins')
  createAdmin(@Body() body: { name: string; email: string }, @Req() req: any) {
    return this.adminService.createAdmin(body, req.user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Put('admins/:userId/panels')
  updateAdminPanels(@Param('userId') userId: string, @Body() body: { panels: string[] }, @Req() req: any) {
    return this.adminService.updateAdminPanels(userId, body.panels || [], req.user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Post('approve-admin/:userId')
  approveAdmin(@Param('userId') userId: string, @Req() req: any) {
    return this.adminService.approveAdmin(userId, req.user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Post('reject-admin/:userId')
  rejectAdmin(@Param('userId') userId: string) {
    return this.adminService.rejectAdmin(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Post('revoke-admin/:userId')
  revokeAdmin(@Param('userId') userId: string) {
    return this.adminService.revokeAdmin(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('logs')
  @Get('audit-logs')
  getAuditLogs(@Query('userId') userId?: string, @Query('entity') entity?: string, @Query('action') action?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.auditService.findAll(userId, entity, action, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('logs')
  @Get('audit-stats')
  getAuditStats() { return this.auditService.getStats(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('report')
  @Get('report')
  getMonthlyReport(@Query('userId') userId?: string, @Query('month') month?: string, @Query('year') year?: string) {
    return this.adminService.getMonthlyReport(userId, month ? parseInt(month) : new Date().getMonth() + 1, year ? parseInt(year) : new Date().getFullYear());
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('transactions')
  @Get('all-transactions')
  getAllTransactions(@Query('userId') userId?: string, @Query('month') month?: string, @Query('year') year?: string) {
    return this.adminService.getAllTransactions(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('accounts')
  @Get('all-accounts')
  getAllAccounts(@Query('userId') userId?: string) { return this.adminService.getAllAccounts(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('cards')
  @Get('all-cards')
  getAllCards(@Query('userId') userId?: string) { return this.adminService.getAllCards(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('budgets')
  @Get('all-budgets')
  getAllBudgets(@Query('userId') userId?: string, @Query('month') month?: string, @Query('year') year?: string) {
    return this.adminService.getAllBudgets(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('goals')
  @Get('all-goals')
  getAllGoals(@Query('userId') userId?: string) { return this.adminService.getAllGoals(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('categories')
  @Get('all-categories')
  getAllCategories(@Query('userId') userId?: string) { return this.adminService.getAllCategories(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Get('asaas-config')
  getAsaasConfig() { return this.adminService.getAsaasConfig(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Put('asaas-config')
  updateAsaasConfig(@Body() body: { apiKey?: string; webhookUrl?: string; environment?: string }) {
    return this.adminService.updateAsaasConfig(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Get('workspaces')
  getWorkspaces() { return this.adminService.getWorkspaces(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Get('subscriptions-finance')
  getSubscriptionsFinance() { return this.adminService.getSubscriptionsFinance(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Get('reminder-views')
  getReminderViews() { return this.adminService.getReminderViews(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Post('subscriptions-finance/:userId/block')
  blockUser(@Param('userId') userId: string, @Body() body: { reason?: string }, @Request() req) {
    return this.adminService.blockUserForPayment(userId, body?.reason, req.user?.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Post('subscriptions-finance/:userId/unblock')
  unblockUser(@Param('userId') userId: string, @Body() body: { accessUntil?: string }, @Request() req) {
    return this.adminService.unblockUserForPayment(userId, body?.accessUntil, req.user?.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Post('subscriptions-finance/:userId/payments')
  registerPayment(@Param('userId') userId: string, @Body() body: { amount?: number; dueDate: string; notes?: string }, @Request() req) {
    return this.adminService.registerPayment(userId, body, req.user?.email);
  }

@UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('transactions')
  @Get('all-transactions-export')
  getAllTransactionsExport(
    @Query('userId') userId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ) {
    return this.adminService.getAllTransactionsExport(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined, type);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin', 'master')
  @AdminPanel('overview')
  @Get('export-excel')
  async exportExcel(
    @Res() res: Response,
    @Query('userId') userId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const buffer = await this.adminService.exportExcel(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=financeapp-admin-${new Date().toISOString().slice(0, 10)}.xlsx`);
    res.send(buffer);
  }
}