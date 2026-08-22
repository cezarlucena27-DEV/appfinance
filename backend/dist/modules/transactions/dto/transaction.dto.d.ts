export declare class CreateTransactionDto {
    accountId: string;
    categoryId: string;
    cardId?: string;
    type: string;
    amount: number;
    description?: string;
    date: string;
    isRecurring?: boolean;
    recurrenceType?: string;
    totalInstallments?: number;
    dueDate?: string;
    isPaid?: boolean;
}
export declare class UpdateTransactionDto {
    accountId?: string;
    categoryId?: string;
    amount?: number;
    description?: string;
    date?: string;
    isPaid?: boolean;
}
