import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

@Get()
  findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.transactionsService.findAll(req.user.id, { startDate, endDate, type });
  }

@Get('summary')
  getMonthlySummary(@Request() req) {
    return this.transactionsService.getMonthlySummary(req.user.id);
  }

  @Get('monthly-balances')
  getMonthlyBalances(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.getMonthlyBalances(req.user.id, startDate, endDate);
  }

@Get('by-category')
  getByCategory(@Request() req) {
    return this.transactionsService.getByCategory(req.user.id);
  }

  @Get('upcoming')
  getUpcoming(@Request() req, @Query('days') days?: string) {
    return this.transactionsService.findUpcoming(req.user.id, days ? parseInt(days, 10) : 30);
  }

  @Get('overdue')
  getOverdue(@Request() req) {
    return this.transactionsService.findOverdue(req.user.id);
  }

  @Get('alerts')
  getAlerts(@Request() req) {
    return this.transactionsService.getAlerts(req.user.id);
  }

  @Post('recalculate-balance/:accountId')
  async recalculateBalance(@Param('accountId') accountId: string, @Request() req) {
    return this.transactionsService.recalculateAccountBalance(accountId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateTransactionDto, @Request() req) {
    return this.transactionsService.create(req.user.id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto, @Request() req) {
    return this.transactionsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.transactionsService.remove(id, req.user.id);
  }
}
