# การตั้งค่า Supabase Database

## ขั้นตอนการตั้งค่า

### 1. สร้าง Supabase Project
1. ไปที่ https://supabase.com
2. สร้างบัญชีหรือเข้าสู่ระบบ
3. คลิก "New Project"
4. ตั้งชื่อโปรเจค และเลือก Region ที่ใกล้ที่สุด (แนะนำ Southeast Asia)
5. ตั้งรหัสผ่าน Database (เก็บไว้ดีๆ จะใช้ใน .env)
6. รอสักครู่จนโปรเจคสร้างเสร็จ

### 2. หา Connection String
1. ในหน้า Dashboard ของโปรเจค ไปที่ Settings > Database
2. ในส่วน "Connection string" เลือก "URI"
3. คัดลอก Connection string (จะมีหน้าตาประมาณนี้):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### 3. อัพเดทไฟล์ .env
แก้ไขไฟล์ `backend/.env` ดังนี้:

```env
# Database Configuration - Supabase PostgreSQL
DB_TYPE=postgres
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password-here
DB_DATABASE=postgres
```

**หมายเหตุ:** 
- `DB_HOST` คือส่วน `db.xxxxxxxxxxxxx.supabase.co` จาก connection string
- `DB_PASSWORD` คือรหัสผ่านที่ตั้งไว้ตอนสร้างโปรเจค

### 4. รัน Backend
```bash
cd backend
npm run start:dev
```

TypeORM จะสร้างตารางทั้งหมดให้อัตโนมัติ (synchronize: true)

## ข้อดีของ Supabase
- ✅ ฟรี 500MB database storage
- ✅ ฟรี 2GB bandwidth ต่อเดือน
- ✅ Auto backup
- ✅ Real-time subscriptions
- ✅ Built-in authentication (ถ้าต้องการใช้ในอนาคต)
- ✅ Dashboard สำหรับดูข้อมูล
- ✅ SQL Editor สำหรับรัน query

## การดูข้อมูลใน Database
1. ไปที่ Supabase Dashboard
2. เลือก Table Editor
3. จะเห็นตารางทั้งหมดที่ TypeORM สร้างให้

## Troubleshooting

### ถ้าเชื่อมต่อไม่ได้
1. ตรวจสอบว่า IP ของคุณไม่ถูกบล็อก (Supabase อนุญาตทุก IP โดยค่าเริ่มต้น)
2. ตรวจสอบว่ารหัสผ่านถูกต้อง
3. ตรวจสอบว่า DB_HOST ถูกต้อง

### ถ้าต้องการ Reset Database
1. ไปที่ Supabase Dashboard > SQL Editor
2. รันคำสั่ง DROP TABLE ตามต้องการ
3. Restart backend เพื่อให้ TypeORM สร้างตารางใหม่
