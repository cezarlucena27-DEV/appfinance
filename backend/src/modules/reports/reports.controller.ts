import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaidPlanGuard } from '../../common/guards/paid-plan.guard';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('monthly')
  getMonthly(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('scope') scope: string,
    @Request() req,
  ) {
    return this.reportsService.getMonthly(req.user.id, parseInt(month), parseInt(year), scope || 'individual');
  }

  @Get('yearly')
  getYearly(@Query('year') year: string, @Request() req) {
    return this.reportsService.getYearly(req.user.id, parseInt(year));
  }

  @UseGuards(PaidPlanGuard)
  @Get('export/csv')
  async exportCSV(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('scope') scope: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.exportCSV(req.user.id, parseInt(month), parseInt(year), scope || 'individual');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${month}-${year}-${scope || 'individual'}.csv`);
    res.send(csv);
  }

  @UseGuards(PaidPlanGuard)
  @Get('export/pdf')
  async exportPDF(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('scope') scope: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportPDF(req.user.id, parseInt(month), parseInt(year), scope || 'individual');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${month}-${year}-${scope || 'individual'}.pdf`);
    res.send(buffer);
  }

  @UseGuards(PaidPlanGuard)
  @Get('export/excel')
  async exportExcel(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('scope') scope: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportExcel(req.user.id, parseInt(month), parseInt(year), scope || 'individual');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${month}-${year}-${scope || 'individual'}.xlsx`);
    res.send(buffer);
  }
}
