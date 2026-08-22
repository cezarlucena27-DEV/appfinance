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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PDFDocument = require("pdfkit");
const excel_util_1 = require("../../common/utils/excel.util");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getScopeWhere(userId, scope) {
        if (scope !== 'conjunto')
            return { userId };
        const own = await this.prisma.account.findMany({ where: { userId }, select: { id: true } });
        const shares = await this.prisma.accountShare.findMany({ where: { userId }, select: { accountId: true } });
        const sharesByMe = await this.prisma.accountShare.findMany({
            where: { account: { userId } },
            select: { userId: true },
        });
        const ids = new Set(own.map(a => a.id));
        for (const s of shares)
            ids.add(s.accountId);
        const partnerIds = [...new Set(sharesByMe.map(s => s.userId))];
        if (partnerIds.length) {
            const partnerAccounts = await this.prisma.account.findMany({
                where: { userId: { in: partnerIds } },
                select: { id: true },
            });
            for (const a of partnerAccounts)
                ids.add(a.id);
        }
        return { accountId: { in: [...ids] } };
    }
    async getMonthly(userId, month, year, scope = 'individual') {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const where = { date: { gte: startDate, lte: endDate }, ...(await this.getScopeWhere(userId, scope)) };
        const [transactions, summary, byCategory] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: { category: true, account: true, user: { select: { id: true, name: true } } },
                orderBy: { date: 'desc' },
            }),
            this.prisma.transaction.aggregate({
                where: { ...where, type: 'income' },
                _sum: { amount: true },
            }),
            this.prisma.transaction.groupBy({
                by: ['categoryId'],
                where: { ...where, type: 'expense' },
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        const totalIncome = summary._sum.amount || 0;
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const categoryDetails = await Promise.all(byCategory.map(async (cat) => {
            if (!cat.categoryId) {
                return {
                    category: 'Sem categoria',
                    color: '#64748B',
                    total: cat._sum.amount || 0,
                    count: cat._count,
                };
            }
            const category = await this.prisma.category.findUnique({ where: { id: cat.categoryId } });
            return {
                category: category?.name || 'Sem categoria',
                color: category?.color || '#64748B',
                total: cat._sum.amount || 0,
                count: cat._count,
            };
        }));
        return {
            month,
            year,
            scope,
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            transactionCount: transactions.length,
            transactions,
            byCategory: categoryDetails.sort((a, b) => b.total - a.total),
        };
    }
    async getYearly(userId, year) {
        const months = [];
        for (let m = 1; m <= 12; m++) {
            const startDate = new Date(year, m - 1, 1);
            const endDate = new Date(year, m, 0, 23, 59, 59);
            const [income, expense] = await Promise.all([
                this.prisma.transaction.aggregate({
                    where: { userId, date: { gte: startDate, lte: endDate }, type: 'income' },
                    _sum: { amount: true },
                }),
                this.prisma.transaction.aggregate({
                    where: { userId, date: { gte: startDate, lte: endDate }, type: 'expense' },
                    _sum: { amount: true },
                }),
            ]);
            months.push({
                month: m,
                income: income._sum.amount || 0,
                expenses: expense._sum.amount || 0,
                balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
            });
        }
        return months;
    }
    async exportCSV(userId, month, year, scope = 'individual') {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const where = { date: { gte: startDate, lte: endDate }, ...(await this.getScopeWhere(userId, scope)) };
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: { category: true, account: true, user: { select: { name: true } } },
            orderBy: { date: 'desc' },
        });
        const header = 'Data,Tipo,Categoria,Descricao,Valor,Conta,Usuario\n';
        const rows = transactions.map(t => {
            const date = t.date.toISOString().split('T')[0];
            const type = t.type === 'income' ? 'Receita' : 'Despesa';
            const category = t.category?.name || 'Sem categoria';
            const desc = (t.description || '').replace(/,/g, ';');
            const amount = t.amount.toFixed(2);
            const account = t.account?.name || 'Sem conta';
            const owner = t.user?.name || '';
            return `${date},${type},${category},${desc},${amount},${account},${owner}`;
        }).join('\n');
        return header + rows;
    }
    async exportExcel(userId, month, year, scope = 'individual') {
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
                    { label: 'Escopo', value: scope === 'conjunto' ? 'Conjunto' : 'Individual' },
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
                    amount: t.type === 'income' ? t.amount : -t.amount,
                    account: t.account?.name || 'Sem conta',
                    user: t.user?.name || '',
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
        return (0, excel_util_1.buildExcel)(sheets);
    }
    async exportPDF(userId, month, year, scope = 'individual') {
        const data = await this.getMonthly(userId, month, year, scope);
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
        ];
        const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 }, bufferPages: true });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        const MARGIN = 40;
        const PAGE_W = doc.page.width;
        const CONTENT_W = PAGE_W - MARGIN * 2;
        const BOTTOM = doc.page.height - MARGIN;
        const ROW_H = 20;
        const drawTable = (columns, rows) => {
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
                if (i % 2 === 0)
                    doc.rect(x0, y, totalWidth, ROW_H).fill('#F8FAFC');
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
        const sectionTitle = (text, color = '#2563EB') => {
            doc.fillColor(color).font('Helvetica-Bold').fontSize(12).text(text);
            doc.fillColor('#64748B').font('Helvetica').fontSize(8).text('', { lineBreak: true });
            doc.moveDown(0.6);
            doc.fillColor('#1E293B');
        };
        doc.rect(0, 0, PAGE_W, 110).fill('#2563EB');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text('FinanceApp', MARGIN, 30);
        doc.fontSize(14).text('Relatorio Financeiro Mensal', MARGIN, 58);
        doc.font('Helvetica').fontSize(10)
            .text(`${monthNames[month - 1]} de ${year} · Escopo: ${scope === 'conjunto' ? 'Conjunto' : 'Individual'}`, MARGIN, 84);
        doc.fillColor('#1E293B').font('Helvetica').fontSize(10);
        doc.y = 130;
        const summary = [
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
        if (data.byCategory && data.byCategory.length > 0) {
            sectionTitle('Gastos por Categoria');
            drawTable([
                { label: 'Categoria', width: 260 },
                { label: 'Transacoes', width: 100, align: 'center' },
                { label: 'Total', width: 135, align: 'right' },
            ], data.byCategory.map((c) => [c.category, String(c.count), formatCurrency(c.total)]));
        }
        if (data.transactions && data.transactions.length > 0) {
            sectionTitle('Detalhamento das Transacoes');
            drawTable([
                { label: 'Data', width: 58 },
                { label: 'Tipo', width: 58 },
                { label: 'Categoria', width: 88 },
                { label: 'Descricao', width: 128 },
                { label: 'Valor', width: 68, align: 'right' },
                { label: 'Conta', width: 80 },
                { label: 'Usuario', width: 55 },
            ], data.transactions.map((t) => [
                t.date.toLocaleDateString('pt-BR'),
                t.type === 'income' ? 'Receita' : 'Despesa',
                t.category?.name || 'Sem categoria',
                t.description || '',
                `${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}`,
                t.account?.name || 'Sem conta',
                t.user?.name || '',
            ]));
        }
        const pages = doc.bufferedPageRange();
        for (let i = pages.start; i < pages.start + pages.count; i++) {
            doc.switchToPage(i);
            doc.fillColor('#94A3B8').font('Helvetica').fontSize(7)
                .text(`FinanceApp · Gerado em ${new Date().toLocaleString('pt-BR')} · Pagina ${i - pages.start + 1} de ${pages.count}`, MARGIN, doc.page.height - 30, { width: CONTENT_W, align: 'center' });
        }
        doc.end();
        await new Promise((resolve) => doc.on('end', () => resolve()));
        return Buffer.concat(chunks);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map