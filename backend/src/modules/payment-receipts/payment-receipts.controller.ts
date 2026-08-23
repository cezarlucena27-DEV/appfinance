import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';
import { PaymentReceiptsService, RECEIPTS_ALLOWED_MIMES, RECEIPTS_MAX_SIZE, getReceiptsDir } from './payment-receipts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

@Controller('public')
export class PublicPaymentReceiptsController {
  constructor(private receiptsService: PaymentReceiptsService) {}

  @Post('payment-receipts')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, getReceiptsDir()),
        filename: (_req, file, cb) => {
          const raw = extname(file.originalname || '').toLowerCase();
          const ext = ALLOWED_EXTENSIONS.includes(raw) ? raw : '.jpg';
          cb(null, `${uuid()}${ext}`);
        },
      }),
      limits: { fileSize: RECEIPTS_MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();
        const mimeOk = RECEIPTS_ALLOWED_MIMES.includes(file.mimetype);
        // alguns navegadores enviam mimetype generico - valida pela extensao
        const genericMime = ['application/octet-stream', ''].includes(file.mimetype);
        const ok = mimeOk || (genericMime && ALLOWED_EXTENSIONS.includes(ext));
        if (!ok) {
          cb(new BadRequestException('Formato nao permitido. Envie JPG, PNG ou PDF'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('senderName') senderName?: string,
    @Body('senderEmail') senderEmail?: string,
    @Body('note') note?: string,
  ) {
    return this.receiptsService.create(file, { senderName, senderEmail, note });
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_admin')
@Controller('admin/payment-receipts')
export class AdminPaymentReceiptsController {
  constructor(private receiptsService: PaymentReceiptsService) {}

  @Get()
  list(@Query('status') status?: string) {
    return this.receiptsService.list().then((all) =>
      status ? all.filter((r) => r.status === status) : all,
    );
  }

  @Get(':id/file')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const { receipt, path } = await this.receiptsService.getFileInfo(id);
    res.setHeader('Content-Type', receipt.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(receipt.originalName)}"`);
    res.sendFile(path);
  }

  @Put(':id/status')
  setStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    return this.receiptsService.setStatus(id, status, req.user?.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptsService.remove(id);
  }
}
