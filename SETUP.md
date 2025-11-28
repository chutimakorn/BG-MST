# คู่มือการติดตั้งและใช้งาน

## ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. ตั้งค่า Database

#### สำหรับ SQL Server (Development)
1. ติดตั้ง SQL Server Management Studio (SSMS)
2. สร้าง database ชื่อ `sales_management`
3. คัดลอกไฟล์ `.env.example` เป็น `.env`
4. แก้ไขค่าใน `.env`:
```env
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=your_password
DB_DATABASE=sales_management
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

#### สำหรับ PostgreSQL (Production)
แก้ไขค่าใน `.env`:
```env
DB_TYPE=postgres
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=sales_management
```

### 3. ตั้งค่า Frontend
```bash
cd frontend
cp .env.local.example .env.local
```

แก้ไขไฟล์ `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. รันโปรเจค

#### เปิด Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```

Backend จะรันที่ http://localhost:3001

#### เปิด Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend จะรันที่ http://localhost:3000

### 5. เริ่มต้นใช้งาน

1. เปิดเบราว์เซอร์ไปที่ http://localhost:3000
2. สร้างผู้ใช้งานแรก (ใช้ API หรือเพิ่มใน database โดยตรง)
3. Login เข้าสู่ระบบ
4. ไปที่หน้า Master Data และกดปุ่ม "เริ่มต้นข้อมูล" เพื่อโหลดข้อมูลเริ่มต้น
5. เริ่มใช้งานระบบได้เลย!

## การ Deploy ขึ้น Vercel

### Backend
1. สร้าง PostgreSQL database (แนะนำ: Vercel Postgres, Supabase, หรือ Railway)
2. Deploy backend ไปที่ service อื่น (Railway, Render, หรือ Heroku)
3. ตั้งค่า Environment Variables ตามที่กำหนดใน `.env.example`

### Frontend
1. Push code ขึ้น GitHub
2. เชื่อมต่อ repository กับ Vercel
3. ตั้งค่า Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL ของ backend ที่ deploy แล้ว
4. Deploy!

## คำสั่งที่ใช้บ่อย

```bash
# Backend
npm run start:dev    # รัน development mode
npm run build        # Build สำหรับ production
npm run start:prod   # รัน production mode

# Frontend
npm run dev          # รัน development mode
npm run build        # Build สำหรับ production
npm run start        # รัน production mode
```

## ฟีเจอร์หลัก

1. ระบบ Login และ Authentication
2. จัดการใบเสนอราคา (เพิ่ม/แก้ไข/ดู)
3. จัดการ Master Data ทั้งหมด
4. Dashboard แสดงสถิติ
5. รายงานแยกตามเดือนและผู้ขาย
6. กราฟแสดงข้อมูลการขาย
7. Filter ข้อมูลตามช่วงเวลาและผู้ขาย

## หมายเหตุ

- ระบบจะสร้างตารางอัตโนมัติเมื่อรันครั้งแรก (synchronize: true)
- สำหรับ production ควรปิด synchronize และใช้ migration แทน
- ข้อมูล Master Data สามารถเพิ่มเติมได้ในหน้า Master Data
