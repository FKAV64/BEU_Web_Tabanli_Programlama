import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Rfc7807ExceptionFilter } from './rfc7807.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <-- Add this import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new Rfc7807ExceptionFilter());

  // --- SWAGGER SETUP (Task 10) ---
  const config = new DocumentBuilder()
    .setTitle('CampusConnect API')
    .setDescription('The CampusConnect API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  // -------------------------------

  await app.listen(3000);
}
bootstrap();