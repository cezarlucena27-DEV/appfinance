import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.id);
  }

  @Get('balance')
  getBalance(@Request() req) {
    return this.accountsService.getBalance(req.user.id);
  }

  @Roles('master')
  @Get('workspace')
  getWorkspaceAccounts(@Request() req) {
    return this.accountsService.getWorkspaceAccounts(req.user.id);
  }

  @Roles('master')
  @Get('workspace/:accountId/transactions')
  getAccountTransactions(@Param('accountId') accountId: string, @Request() req) {
    return this.accountsService.getAccountTransactions(req.user.id, accountId);
  }

  @Roles('master')
  @Get('workspace/export/excel')
  async exportWorkspaceExcel(@Request() req, @Res() res: Response) {
    const buffer = await this.accountsService.exportWorkspaceExcel(req.user.id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=workspace.xlsx');
    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.accountsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateAccountDto, @Request() req) {
    return this.accountsService.create(req.user.id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto, @Request() req) {
    return this.accountsService.update(id, req.user.id, dto);
  }

  @Post(':id/share')
  linkAccount(@Param('id') id: string, @Body() body: { userId: string }, @Request() req) {
    return this.accountsService.linkAccount(id, req.user.id, body.userId);
  }

  @Delete(':id/share/:userId')
  unlinkAccount(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    return this.accountsService.unlinkAccount(id, req.user.id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.accountsService.remove(id, req.user.id);
  }
}