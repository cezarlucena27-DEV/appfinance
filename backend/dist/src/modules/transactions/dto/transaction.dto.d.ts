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
    type?: string;
    accountId?: string;
    categoryId?: string;
    cardId?: string;
    amount?: number;
    description?: string;
    date?: string;
    isPaid?: boolean;
}
