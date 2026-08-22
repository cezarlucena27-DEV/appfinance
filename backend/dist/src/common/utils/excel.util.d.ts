export interface ExcelSheet {
    name: string;
    columns: {
        header: string;
        key: string;
        width?: number;
    }[];
    rows: Record<string, any>[];
}
export declare function buildExcel(sheets: ExcelSheet[]): Promise<Buffer>;
