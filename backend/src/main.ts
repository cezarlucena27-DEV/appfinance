import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { AuditService } from './modules/admin/audit.service';
import { OnlineTracker } from './modules/admin/online-tracker.service';
import { validateSecurityEnv } from './common/security.config';
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor';

function loadEnvFile() {
  const candidates = [join(process.cwd(), '.env'), join(process.cwd(), '..', '.env')];
  for (const file of candidates) {
    try {
      if (!existsSync(file)) continue;
      for (const line of readFileSync(file, 'utf-8').split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_.]*)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        const key = match[1];
        const value = (match[2] || '').trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) process.env[key] = value;
      }
      break;
    } catch {}
  }
}

async function bootstrap() {
  loadEnvFile();

  if (!process.env.DATABASE_URL) {
    throw new Error('[config] DATABASE_URL nao definida.');
  }

  validateSecurityEnv();

  const app = await NestFactory.create(AppModule);
  const server = app.getHttpAdapter().getInstance();
  const trustProxy = Number(process.env.TRUST_PROXY ?? '0') || 0;
  server.set('trust proxy', trustProxy);
  if (trustProxy === 0) {
    console.warn('[aviso] TRUST_PROXY nao definido - rate limit usa o IP do socket. Defina TRUST_PROXY=1 atras de um proxy.');
  }

  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new DecimalSerializerInterceptor());

  const auditService = app.get(AuditService);
  const { AuditInterceptor } = await import('./common/interceptors/audit.interceptor');
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

  const onlineTracker = app.get(OnlineTracker);
  const { ActivityInterceptor } = await import('./common/interceptors/activity.interceptor');
  app.useGlobalInterceptors(new ActivityInterceptor(onlineTracker));

  const frontendCandidates = [
    process.env.FRONTEND_DIST,
    join(__dirname, '..', '..', 'public'),
    join(process.cwd(), 'public'),
    join(__dirname, '..', 'public'),
    join(__dirname, '..', '..', 'frontend', 'dist'),
    join(process.cwd(), 'frontend', 'dist'),
    join(process.cwd(), '..', 'frontend', 'dist'),
  ].filter(Boolean) as string[];
  const frontendDist = frontendCandidates.find((c) => existsSync(join(c, 'index.html')));
  if (frontendDist) {
    app.use(express.static(frontendDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(join(frontendDist, 'index.html'));
    });
    console.log(`Frontend servido de ${frontendDist}`);
  } else {
    console.warn(`[AVISO] Frontend nao encontrado. Caminhos testados: ${frontendCandidates.join(' | ')}`);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`FinanceApp API running on port ${port}`);
}
bootstrap();
