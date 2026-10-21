import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import { buildExcel } from '../../common/utils/excel.util';
import { moneyNumber } from '../../common/money';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Escopo "conjunto": transacoes do proprio usuario (em qualquer conta) mais as
  // de contas dele ou compartilhadas com ele. Contas do parceiro que nao foram
  // compartilhadas nunca entram no relatorio.
  private getScopeWhere(userId: string, scope: string): Prisma.TransactionWhereInput {
    if (scope !== 'conjunto') return { userId };
    return {
      OR: [
        { userId },
        { account: { userId } },
        { account: { shares: { some: { userId } } } },
      ],
    };
  }

  async getMonthly(userId: string, month: number, year: number, scope = 'individual') {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const where: Prisma.TransactionWhereInput = { date: { gte: startDate, lte: endDate }, ...this.getScopeWhere(userId, scope) };

    const [transactions, incomeAgg, expenseAgg, txCount, byCategory] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { category: true, account: true, user: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
        take: 5000,
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = moneyNumber(incomeAgg._sum.amount);
    const totalExpenses = moneyNumber(expenseAgg._sum.amount);

    const categoryDetails = await Promise.all(
      byCategory.map(async (cat) => {
        if (!cat.categoryId) {
          return {
            category: 'Sem categoria',
            color: '#64748B',
            total: moneyNumber(cat._sum.amount),
            count: cat._count,
          };
        }
        const category = await this.prisma.category.findUnique({ where: { id: cat.categoryId } });
        return {
          category: category?.name || 'Sem categoria',
          color: category?.color || '#64748B',
          total: moneyNumber(cat._sum.amount),
          count: cat._count,
        };
      })
    );

    return {
      month,
      year,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: txCount,
      transactions,
      byCategory: categoryDetails.sort((a, b) => b.total - a.total),
    };
  }

  async getYearly(userId: string, year: number, scope = 'individual') {
    const scopeWhere = this.getScopeWhere(userId, scope);
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59);

      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: { ...scopeWhere, date: { gte: startDate, lte: endDate }, type: 'income' },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: { ...scopeWhere, date: { gte: startDate, lte: endDate }, type: 'expense' },
          _sum: { amount: true },
        }),
      ]);

      months.push({
        month: m,
        income: moneyNumber(income._sum.amount),
        expenses: moneyNumber(expense._sum.amount),
        balance: moneyNumber(income._sum.amount) - moneyNumber(expense._sum.amount),
      });
    }
    return months;
  }

  async exportCSV(userId: string, month: number, year: number, scope = 'individual') {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const where: Prisma.TransactionWhereInput = { date: { gte: startDate, lte: endDate }, ...this.getScopeWhere(userId, scope) };

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { category: true, account: true, user: { select: { name: true } } },
      orderBy: { date: 'desc' },
      take: 5000,
    });

    const cell = (value: unknown): string => {
      let text = String(value ?? '');
      if (/^[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };

    const header = ['Data', 'Tipo', 'Categoria', 'Descricao', 'Valor', 'Conta', 'Usuario'].map(cell).join(',');
    const rows = transactions.map(t => [
      t.date.toISOString().split('T')[0],
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.category?.name || 'Sem categoria',
      t.description || '',
      moneyNumber(t.amount).toFixed(2),
      t.account?.name || 'Sem conta',
      t.user?.name || '',
    ].map(cell).join(',')).join('\n');

    return header + '\n' + rows;
  }

  async exportExcel(userId: string, month: number, year: number, scope = 'individual') {
    const data = await this.getMonthly(userId, month, year, scope);
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    const sheets = [
      {
        name: 'Resumo',
        columns: [
          { header: 'Indicador', key: 'label', width: 20 },
          { header: 'Valor', key: 'value', width: 16 },
        ],
        rows: [
          { label: 'Mes', value: `${monthNames[month - 1]} de ${year}` },
          { label: 'Receitas', value: data.totalIncome },
          { label: 'Despesas', value: data.totalExpenses },
          { label: 'Saldo', value: data.balance },
          { label: 'Transacoes', value: data.transactionCount },
        ],
      },
      {
        name: 'Transacoes',
        columns: [
          { header: 'Data', key: 'date', width: 12 },
          { header: 'Tipo', key: 'type', width: 10 },
          { header: 'Categoria', key: 'category', width: 18 },
          { header: 'Descricao', key: 'description', width: 30 },
          { header: 'Valor', key: 'amount', width: 14 },
          { header: 'Conta', key: 'account', width: 16 },
          { header: 'Usuario', key: 'user', width: 18 },
        ],
        rows: data.transactions.map((t) => ({
          date: t.date.toLocaleDateString('pt-BR'),
          type: t.type === 'income' ? 'Receita' : 'Despesa',
          category: t.category?.name || 'Sem categoria',
          description: t.description || '',
          amount: t.type === 'income' ? moneyNumber(t.amount) : -moneyNumber(t.amount),
          account: t.account?.name || 'Sem conta',
          user: (t as any).user?.name || '',
        })),
      },
      {
        name: 'Gastos por Categoria',
        columns: [
          { header: 'Categoria', key: 'category', width: 24 },
          { header: 'Transacoes', key: 'count', width: 12 },
          { header: 'Total', key: 'total', width: 16 },
        ],
        rows: (data.byCategory || []).map((c) => ({
          category: c.category,
          count: c.count,
          total: c.total,
        })),
      },
    ];

    return buildExcel(sheets);
  }

  async exportPDF(userId: string, month: number, year: number, scope = 'individual'): Promise<Buffer> {
    const data = await this.getMonthly(userId, month, year, scope);

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    const formatCurrency = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 }, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));

    const MARGIN = 40;
    const PAGE_W = doc.page.width;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const BOTTOM = doc.page.height - MARGIN;
    const ROW_H = 20;

    const drawTable = (
      columns: { label: string; width: number; align?: 'left' | 'right' | 'center' }[],
      rows: (string | number)[][],
    ) => {
      const totalWidth = columns.reduce((s, c) => s + c.width, 0);
      const x0 = MARGIN + (CONTENT_W - totalWidth) / 2;

      const drawHeader = () => {
        doc.rect(x0, doc.y, totalWidth, ROW_H).fill('#1E293B');
        let x = x0;
        columns.forEach((c) => {
          doc.fillColor('#FFFFFF')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text(c.label, x + 4, doc.y + 6, { width: c.width - 8, align: c.align || 'left' });
          x += c.width;
        });
        doc.y += ROW_H;
      };

      drawHeader();

      rows.forEach((row, i) => {
        if (doc.y + ROW_H > BOTTOM) {
          doc.addPage();
          drawHeader();
        }
        const y = doc.y;
        if (i % 2 === 0) doc.rect(x0, y, totalWidth, ROW_H).fill('#F8FAFC');
        doc.fillColor('#1E293B');
        let x = x0;
        columns.forEach((c, j) => {
          const value = String(row[j] ?? '');
          doc.font('Helvetica').fontSize(8).text(value, x + 4, y + 6, {
            width: c.width - 8,
            align: c.align || 'left',
            ellipsis: true,
            lineBreak: false,
          });
          x += c.width;
        });
        doc.moveTo(x0, y + ROW_H).lineTo(x0 + totalWidth, y + ROW_H)
          .strokeColor('#E2E8F0').lineWidth(0.5).stroke();
        doc.y = y + ROW_H;
      });

      doc.y += 10;
    };

    const sectionTitle = (text: string, color = '#2563EB') => {
      doc.fillColor(color).font('Helvetica-Bold').fontSize(12).text(text);
      doc.fillColor('#64748B').font('Helvetica').fontSize(8).text('', { lineBreak: true });
      doc.moveDown(0.6);
      doc.fillColor('#1E293B');
    };

    // Cabecalho
    doc.rect(0, 0, PAGE_W, 110).fill('#2563EB');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text('FinanceApp', MARGIN, 30);
    doc.fontSize(14).text('Relatorio Financeiro Mensal', MARGIN, 58);
    doc.font('Helvetica').fontSize(10)
      .text(`${monthNames[month - 1]} de ${year}`, MARGIN, 84);
    doc.fillColor('#1E293B').font('Helvetica').fontSize(10);
    doc.y = 130;

    // Resumo
    const summary: { label: string; value: string; color: string }[] = [
      { label: 'Receitas', value: formatCurrency(data.totalIncome), color: '#10B981' },
      { label: 'Despesas', value: formatCurrency(data.totalExpenses), color: '#EF4444' },
      { label: 'Saldo', value: formatCurrency(data.balance), color: data.balance >= 0 ? '#10B981' : '#EF4444' },
      { label: 'Transacoes', value: String(data.transactionCount), color: '#1E293B' },
    ];
    const boxW = (CONTENT_W - 30) / 4;
    summary.forEach((s, i) => {
      const x = MARGIN + i * (boxW + 10);
      doc.rect(x, doc.y, boxW, 52).fill('#F8FAFC');
      doc.rect(x, doc.y, boxW, 3).fill(s.color);
      doc.fillColor('#64748B').font('Helvetica').fontSize(8).text(s.label.toUpperCase(), x + 10, doc.y + 12);
      doc.fillColor(s.color).font('Helvetica-Bold').fontSize(12).text(s.value, x + 10, doc.y + 26);
      doc.fillColor('#1E293B');
    });
    doc.y += 62;

    // Gastos por categoria
    if (data.byCategory && data.byCategory.length > 0) {
      sectionTitle('Gastos por Categoria');
      drawTable(
        [
          { label: 'Categoria', width: 260 },
          { label: 'Transacoes', width: 100, align: 'center' },
          { label: 'Total', width: 135, align: 'right' },
        ],
        data.byCategory.map((c) => [c.category, String(c.count), formatCurrency(c.total)]),
      );
    }

    // Detalhamento das transacoes
    if (data.transactions && data.transactions.length > 0) {
      sectionTitle('Detalhamento das Transacoes');
      drawTable(
        [
          { label: 'Data', width: 58 },
          { label: 'Tipo', width: 58 },
          { label: 'Categoria', width: 88 },
          { label: 'Descricao', width: 128 },
          { label: 'Valor', width: 68, align: 'right' },
          { label: 'Conta', width: 80 },
          { label: 'Usuario', width: 55 },
        ],
        data.transactions.map((t) => [
          t.date.toLocaleDateString('pt-BR'),
          t.type === 'income' ? 'Receita' : 'Despesa',
          t.category?.name || 'Sem categoria',
          t.description || '',
          `${t.type === 'income' ? '+' : '-'} ${formatCurrency(moneyNumber(t.amount))}`,
          t.account?.name || 'Sem conta',
          (t as any).user?.name || '',
        ]),
      );
    }

    // Rodape
    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < pages.start + pages.count; i++) {
      doc.switchToPage(i);
      doc.fillColor('#94A3B8').font('Helvetica').fontSize(7)
        .text(`FinanceApp · Gerado em ${new Date().toLocaleString('pt-BR')} · Pagina ${i - pages.start + 1} de ${pages.count}`, MARGIN, doc.page.height - 30, { width: CONTENT_W, align: 'center' });
    }

    doc.end();
    await new Promise<void>((resolve) => doc.on('end', () => resolve()));
    return Buffer.concat(chunks);
  }
}
