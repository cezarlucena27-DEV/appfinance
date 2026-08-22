import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuditService } from './modules/admin/audit.service';
import { OnlineTracker } from './modules/admin/online-tracker.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.setGlobalPrefix('api');
  
  const auditService = app.get(AuditService);
  const { AuditInterceptor } = await import('./common/interceptors/audit.interceptor');
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

  const onlineTracker = app.get(OnlineTracker);
  const { ActivityInterceptor } = await import('./common/interceptors/activity.interceptor');
  app.useGlobalInterceptors(new ActivityInterceptor(onlineTracker));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`FinanceApp API running on port ${port}`);
}
bootstrap();
