declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { patchNestJsSwagger } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Patch Swagger for Zod support
  patchNestJsSwagger();
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable global Zod validation
  app.useGlobalPipes(new ZodValidationPipe());
  
  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Robotics Tournament API')
    .setDescription('API for managing robotics tournaments')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Global API prefix
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
