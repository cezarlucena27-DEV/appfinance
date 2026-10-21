import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

const WINDOW_MS = 60_000;
const STRICT_LIMIT = 5;
const DEFAULT_LIMIT = 30;

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly hits = new Map<string, number[]>();
  private static lastCleanup = Date.now();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const path = String(request.path || request.url || '');
    // refresh fica no limite padrao: exige um token assinado (nao ha brute force)
    // e o frontend o chama a cada carregamento de pagina.
    const strict = /(login|forgot-password|reset-password|register|payment-receipts)/.test(path);
    const limit = strict ? STRICT_LIMIT : DEFAULT_LIMIT;
    // Usa o IP do socket (nao spoofavel) quando disponivel; request.ip so e
    // confiavel quando TRUST_PROXY esta configurado para o numero real de proxies.
    const trustProxy = Number(process.env.TRUST_PROXY ?? '0') || 0;
    const clientIp = trustProxy > 0
      ? (request.ip || request.socket?.remoteAddress || 'unknown')
      : (request.socket?.remoteAddress || 'unknown');
    const key = `${clientIp}|${path}`;
    const now = Date.now();

    this.cleanup(now);

    const windowStart = now - WINDOW_MS;
    const previous = (RateLimitGuard.hits.get(key) || []).filter((time) => time > windowStart);
    if (previous.length >= limit) {
      throw new HttpException('Muitas tentativas. Aguarde um minuto e tente novamente.', HttpStatus.TOO_MANY_REQUESTS);
    }
    previous.push(now);
    RateLimitGuard.hits.set(key, previous);
    return true;
  }

  private cleanup(now: number) {
    if (now - RateLimitGuard.lastCleanup < WINDOW_MS) return;
    RateLimitGuard.lastCleanup = now;
    const windowStart = now - WINDOW_MS;
    for (const [key, times] of RateLimitGuard.hits.entries()) {
      const recent = times.filter((time) => time > windowStart);
      if (recent.length) RateLimitGuard.hits.set(key, recent);
      else RateLimitGuard.hits.delete(key);
    }
  }
}
