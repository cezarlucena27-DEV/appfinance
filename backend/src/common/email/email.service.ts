import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) return this.transporter;
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return null;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return this.transporter;
  }

  get configured(): boolean {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  async sendVerificationCode(email: string, code: string): Promise<boolean> {
    const tx = this.getTransporter();
    if (!tx) {
      console.warn(
        `[aviso] SMTP nao configurado - codigo de verificacao para ${email}: ${code} (modo fallback)`,
      );
      return false;
    }
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    await tx.sendMail({
      from: `"FinanceApp" <${from}>`,
      to: email,
      subject: `Seu codigo de verificacao: ${code}`,
      text: `Seu codigo de verificacao e ${code}. Ele expira em 15 minutos.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border-radius:12px;border:1px solid #e5e7eb">
          <h2 style="margin:0 0 8px">Verificacao de email</h2>
          <p style="color:#4b5563;margin:0 0 16px">Use o codigo abaixo para concluir seu cadastro no FinanceApp:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;background:#f3f4f6;border-radius:8px">${code}</div>
          <p style="color:#6b7280;font-size:13px;margin-top:16px">Este codigo expira em 15 minutos. Se voce nao solicitou, ignore este email.</p>
        </div>`,
    });
    return true;
  }
}
