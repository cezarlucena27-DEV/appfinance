import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditService } from './audit.service';
import {
  AsaasConfigDto,
  BlockUserDto,
  CreateAdminDto,
  RegisterPaymentDto,
  ToggleUserActiveDto,
  UnblockUserDto,
  UpdateAdminPanelsDto,
  UpdateAdminUserDto,
  UpdateUserRoleDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminPanelGuard } from '../../common/guards/admin-panel.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminPanel } from '../../common/decorators/admin-panel.decorator';
import { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService, private auditService: AuditService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('overview')
  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('overview')
  @Get('online')
  getOnlineUsers() { return this.adminService.getOnlineUsers(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
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
  @Roles('platform_admin')
  @AdminPanel('users')
  @Get('users')
  getUsers() { return this.adminService.getUsers(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('users')
  @Get('user-summary')
  getUserSummary(@Query('userId') userId: string) { return this.adminService.getUserSummary(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('users')
  @Get('user-detail')
  getUserDetail(@Query('userId') userId: string) { return this.adminService.getUserDetail(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('users')
  @Put('users/:userId')
  updateUser(@Param('userId') userId: string, @Body() body: UpdateAdminUserDto, @Req() req: any) {
    return this.adminService.updateUser(userId, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('users')
  @Put('users/:userId/role')
  updateUserRole(@Param('userId') userId: string, @Body() body: UpdateUserRoleDto, @Req() req: any) {
    return this.adminService.updateUserRole(userId, body.role, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('users')
  @Put('users/:userId/toggle-active')
  toggleUserActive(@Param('userId') userId: string, @Body() body: ToggleUserActiveDto, @Req() req: any) {
    return this.adminService.toggleUserActive(userId, body?.message, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('users')
  @Post('users/:userId/reset-password')
  resetUserPassword(@Param('userId') userId: string, @Req() req: any) { return this.adminService.resetUserPassword(userId, req.user); }

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
  createAdmin(@Body() body: CreateAdminDto, @Req() req: any) {
    return this.adminService.createAdmin(body, req.user.email, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('admins')
  @Put('admins/:userId/panels')
  updateAdminPanels(@Param('userId') userId: string, @Body() body: UpdateAdminPanelsDto, @Req() req: any) {
    return this.adminService.updateAdminPanels(userId, body.panels || [], req.user.email, req.user.id);
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
  @Roles('platform_admin')
  @AdminPanel('logs')
  @Get('audit-logs')
  getAuditLogs(@Query('userId') userId?: string, @Query('entity') entity?: string, @Query('action') action?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.auditService.findAll(userId, entity, action, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('logs')
  @Get('audit-stats')
  getAuditStats() { return this.auditService.getStats(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('report')
  @Get('report')
  getMonthlyReport(@Query('userId') userId?: string, @Query('month') month?: string, @Query('year') year?: string) {
    return this.adminService.getMonthlyReport(userId, month ? parseInt(month) : new Date().getMonth() + 1, year ? parseInt(year) : new Date().getFullYear());
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('transactions')
  @Get('all-transactions')
  getAllTransactions(@Query('userId') userId?: string, @Query('month') month?: string, @Query('year') year?: string) {
    return this.adminService.getAllTransactions(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('accounts')
  @Get('all-accounts')
  getAllAccounts(@Query('userId') userId?: string) { return this.adminService.getAllAccounts(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('cards')
  @Get('all-cards')
  getAllCards(@Query('userId') userId?: string) { return this.adminService.getAllCards(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('budgets')
  @Get('all-budgets')
  getAllBudgets(@Query('userId') userId?: string, @Query('month') month?: string, @Query('year') year?: string) {
    return this.adminService.getAllBudgets(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('goals')
  @Get('all-goals')
  getAllGoals(@Query('userId') userId?: string) { return this.adminService.getAllGoals(userId); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
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
  updateAsaasConfig(@Body() body: AsaasConfigDto, @Req() req: any) {
    return this.adminService.updateAsaasConfig(body, req.user?.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Get('workspaces')
  getWorkspaces() { return this.adminService.getWorkspaces(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Get('subscriptions-finance')
  getSubscriptionsFinance() { return this.adminService.getSubscriptionsFinance(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Get('reminder-views')
  getReminderViews() { return this.adminService.getReminderViews(); }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Post('subscriptions-finance/:userId/block')
  blockUser(@Param('userId') userId: string, @Body() body: BlockUserDto, @Request() req) {
    return this.adminService.blockUserForPayment(userId, body?.reason, req.user?.email, req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Post('subscriptions-finance/:userId/unblock')
  unblockUser(@Param('userId') userId: string, @Body() body: UnblockUserDto, @Request() req) {
    return this.adminService.unblockUserForPayment(userId, body?.accessUntil, req.user?.email, req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
  @AdminPanel('configs')
  @Post('subscriptions-finance/:userId/payments')
  registerPayment(@Param('userId') userId: string, @Body() body: RegisterPaymentDto, @Request() req) {
    return this.adminService.registerPayment(userId, body, req.user?.email, req.user?.id);
  }

@UseGuards(JwtAuthGuard, RolesGuard, AdminPanelGuard)
  @Roles('platform_admin')
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
  @Roles('platform_admin')
  @AdminPanel('overview')
  @Get('export-excel')
  async exportExcel(
    @Res() res: Response,
    @Query('userId') userId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const buffer = await this.adminService.exportExcel(userId, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=financeapp-admin-${stamp}.xlsx`);
    res.send(buffer);
  }
}