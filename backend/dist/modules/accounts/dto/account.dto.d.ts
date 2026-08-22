export declare class CreateAccountDto {
    name: string;
    type?: string;
    initialBalance: number;
    icon?: string;
    color?: string;
    isPrimary?: boolean;
}
export declare class UpdateAccountDto {
    name?: string;
    type?: string;
    icon?: string;
    color?: string;
    isPrimary?: boolean;
}
