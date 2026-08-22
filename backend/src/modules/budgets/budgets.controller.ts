import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  findAll(@Request() req) {
    return this.budgetsService.findAll(req.user.id);
  }

  @Get('progress')
  getProgress(@Request() req) {
    return this.budgetsService.getProgress(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.budgetsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateBudgetDto, @Request() req) {
    return this.budgetsService.create(req.user.id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBudgetDto, @Request() req) {
    return this.budgetsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.budgetsService.remove(id, req.user.id);
  }
}
