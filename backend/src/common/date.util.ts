import { BadRequestException } from '@nestjs/common';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// Datas "yyyy-mm-dd" sao gravadas ao meio-dia UTC para que a data exibida
// seja a mesma em qualquer fuso entre UTC-12 e UTC+12.
export function parseDateOnly(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;
  const text = String(value).trim();
  if (DATE_ONLY.test(text)) return new Date(`${text}T12:00:00.000Z`);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`Data invalida: ${text}`);
  }
  return parsed;
}

export function startOfMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}
