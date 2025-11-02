import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CertificateVerificationInterceptor } from './shared/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Apply certificate verification interceptor globally if enabled
  const configService = app.get(ConfigService);
  const thumbprints = configService.get<string>('ALLOWED_CERTIFICATE_THUMBPRINTS', '');

  if (thumbprints && thumbprints.trim().length > 0) {
    app.useGlobalInterceptors(
      new CertificateVerificationInterceptor(configService),
    );
    console.log('Certificate verification enabled');
  } else {
    console.log('Certificate verification disabled (no thumbprints configured)');
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Uniflow Notification Service')
    .setDescription(
      `The Notification Service API provides comprehensive endpoints for managing user notifications within the Uniflow platform.

## Features
- **Create Notifications**: Send notifications to users via multiple channels (email, push, WebSocket)
- **Query Notifications**: Retrieve paginated notifications with filtering options
- **Mark as Read**: Track notification read status
- **Real-time Updates**: WebSocket support for instant notification delivery
- **Scheduling**: Schedule notifications for future delivery

## WebSocket Events
The service also provides WebSocket support for real-time notifications:
- **Connection**: ws://your-server/socket.io?userId=<user-id>
- **Event**: 'new_notification' - Emitted when a new notification is created for the connected user

## Notification Types
- **deadline_reminder**: Reminder for upcoming deadlines
- **exam_reminder**: Reminder for upcoming exams
- **task_created**: Notification when a new task is created
- **grade_posted**: Notification when a grade is posted

## Priority Levels
- **high**: Urgent notifications requiring immediate attention
- **medium**: Standard priority notifications
- **low**: Informational notifications`,
    )
    .setVersion('1.0')
    .addTag('Notifications', 'Endpoints for managing user notifications')
    .setContact('Uniflow Team', 'https://uniflow.com', 'support@uniflow.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    customSiteTitle: 'Uniflow Notification Service API',
    customfavIcon: 'https://uniflow.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation available at: http://localhost:${port}/docs`,
  );
}
void bootstrap();
