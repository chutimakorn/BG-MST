# Sales Management System

ระบบจัดการข้อมูลการขายรถพร้อม Dashboard และ Report

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- Backend: NestJS, TypeORM
- Database: SQL Server (dev), PostgreSQL (production)
- Deployment: Vercel

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env
# แก้ไข .env ตามการตั้งค่า database
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- ระบบ Login และ Authentication
- จัดการข้อมูลใบเสนอราคา (เพิ่ม/แก้ไข)
- จัดการ Master Data ทั้งหมด
- Dashboard แสดงสถิติการขาย
- Report แยกตามเลขที่ใบเสนอราคาและผู้ขาย
- Filter และ Export ข้อมูล
