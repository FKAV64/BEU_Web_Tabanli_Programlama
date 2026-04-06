import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Rfc7807ExceptionFilter } from './rfc7807.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new Rfc7807ExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
