import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // เพิ่ม body parser limit สำหรับไฟล์ขนาดใหญ่
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  
  // CORS configuration - รองรับหลาย origins
  app.enableCors({
    origin: (origin, callback) => {
      // อนุญาตให้ไม่มี origin (เช่น mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      // อนุญาต localhost ทุก port
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // อนุญาต Vercel preview/production URLs
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      // อนุญาต FRONTEND_URL ที่กำหนดใน env
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
