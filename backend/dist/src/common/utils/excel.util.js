"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExcel = buildExcel;
const ExcelJS = require("exceljs");
async function buildExcel(sheets) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'FinanceApp';
    wb.created = new Date();
    for (const sheet of sheets) {
        const ws = wb.addWorksheet(sheet.name.slice(0, 31));
        ws.columns = sheet.columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 18 }));
        ws.addRows(sheet.rows);
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        headerRow.alignment = { vertical: 'middle' };
        ws.views = [{ state: 'frozen', ySplit: 1 }];
    }
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
}
//# sourceMappingURL=excel.util.js.map