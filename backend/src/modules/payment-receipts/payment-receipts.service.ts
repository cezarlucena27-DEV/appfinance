import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';

export const RECEIPTS_MAX_SIZE = 5 * 1024 * 1024;
export const RECEIPTS_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function getReceiptsDir(): string {
  const dir = join(process.cwd(), 'uploads', 'receipts');
  mkdirSync(dir, { recursive: true });
  return dir;
}

@Injectable()
export class PaymentReceiptsService {
  constructor(private prisma: PrismaService) {}

  async create(file: Express.Multer.File | undefined, data: { senderName?: string; senderEmail?: string; note?: string }) {
    if (!file) throw new BadRequestException('Arquivo nao enviado');
    if (file.size > RECEIPTS_MAX_SIZE) throw new BadRequestException('Arquivo maior que 5MB');

    return this.prisma.paymentReceipt.create({
      data: {
        storedName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        senderName: data.senderName?.trim() || null,
        senderEmail: data.senderEmail?.trim().toLowerCase() || null,
        note: data.note?.trim() || null,
      },
    });
  }

  async list() {
    return this.prisma.paymentReceipt.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  private async getWithFile(id: string) {
    const receipt = await this.prisma.paymentReceipt.findUnique({ where: { id } });
    if (!receipt) throw new NotFoundException('Comprovante nao encontrado');
    const path = join(getReceiptsDir(), receipt.storedName);
    if (!existsSync(path)) throw new NotFoundException('Arquivo nao encontrado no servidor');
    return { receipt, path };
  }

  async getFileInfo(id: string) {
    return this.getWithFile(id);
  }

  async setStatus(id: string, status: string, adminEmail?: string) {
    if (!['pending', 'reviewed'].includes(status)) throw new BadRequestException('Status invalido');
    const existing = await this.prisma.paymentReceipt.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Comprovante nao encontrado');
    return this.prisma.paymentReceipt.update({
      where: { id },
      data: {
        status,
        reviewedAt: status === 'reviewed' ? new Date() : null,
        reviewedBy: status === 'reviewed' ? adminEmail || 'admin' : null,
      },
    });
  }

  async remove(id: string) {
    const receipt = await this.prisma.paymentReceipt.findUnique({ where: { id } });
    if (!receipt) throw new NotFoundException('Comprovante nao encontrado');
    try {
      const path = join(getReceiptsDir(), receipt.storedName);
      if (existsSync(path)) unlinkSync(path);
    } catch {
      // arquivo ja removido - segue a exclusao do registro
    }
    await this.prisma.paymentReceipt.delete({ where: { id } });
    return { success: true };
  }
}
