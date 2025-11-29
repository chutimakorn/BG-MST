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
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean); // กรองค่า undefined ออก

  app.enableCors({
    origin: (origin, callback) => {
      // อนุญาตให้ไม่มี origin (เช่น mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      // อนุญาต Vercel preview/production URLs
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      // ตรวจสอบ allowed origins
      if (allowedOrigins.includes(origin)) {
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
