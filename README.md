# BG-MST - Sales Management System

ระบบจัดการข้อมูลการขายรถพร้อม Dashboard และ Report

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- Backend: NestJS, TypeORM
- Database: SQLite (dev), SQL Server/PostgreSQL (production)
- UI: NextAdmin-style dashboard with dark mode support

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
cp .env.local.example .env.local
npm run dev
```

## Features
- ระบบ Login และ Authentication
- NextAdmin-style Dashboard พร้อม Dark/Light Mode
- Sidebar และ Header แบบ responsive
- จัดการข้อมูลใบเสนอราคา (เพิ่ม/แก้ไข/ลบ)
- จัดการ Job Orders
- Import ข้อมูลจาก Excel และ PDF
- จัดการ Master Data ทั้งหมด
- Dashboard แสดงสถิติการขาย พร้อม Charts
- Report แยกตามเลขที่ใบเสนอราคาและผู้ขาย
- Filter และ Export ข้อมูล
