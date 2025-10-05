import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Rechaza si hay propiedades extra
      transform: true, // Transforma tipos automáticamente
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
