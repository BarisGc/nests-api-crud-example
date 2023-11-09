import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AtGuard } from './auth/guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this will remove any properties that are not in the DTO,
      transform: true, // this will transform the incoming data to the DTO type. ex: string to number so no need ParseIntPipe etc.
      forbidNonWhitelisted: true, // this will throw an error if there is a property that is not in the DTO
      // it is good for development, you can check if extra property is delivered accidentally,
      disableErrorMessages:
        process.env.NODE_ENV === 'production' ? true : false, // this will disable error messages in production mode
    }),
  );

  // feature: first way to make AtGuard global
  // const reflector = new Reflector();
  // app.useGlobalGuards(new AtGuard(reflector));

  // feature: global interceptor
  // app.useGlobalInterceptors(new LoggingInterceptor());

  // feature: swagger
  const authConfig = new DocumentBuilder()
    .setTitle('Nest.js Crud API Example')
    .setDescription('API endpoints for crud operations')
    .setVersion('1.0')
    .addTag('Controllers')
    .build();
  const authDocument = SwaggerModule.createDocument(app, authConfig);
  SwaggerModule.setup('api/auth', app, authDocument);

  await app.listen(3333);
}
bootstrap();
