# Railway Environment Variables Setup

## วิธีตั้งค่า Environment Variables ใน Railway

### ขั้นตอนที่ 1: เตรียม Supabase Connection Info

คุณใช้ Supabase อยู่แล้ว ดังนั้นไม่ต้องสร้าง database ใหม่ใน Railway

ใช้ข้อมูลจาก `backend/.env` ที่มีอยู่:
- DB_HOST: `db.ndpdncfzdkrecuzczcho.supabase.co`
- DB_PORT: `5432`
- DB_USERNAME: `postgres`
- DB_PASSWORD: `1412Moon@`
- DB_DATABASE: `postgres`

### ขั้นตอนที่ 2: เพิ่ม Environment Variables สำหรับ Backend

ไปที่ Backend service → **Variables** tab แล้วเพิ่ม:

```
PORT=3001
```

```
DB_TYPE=postgres
```

```
DB_HOST=db.ndpdncfzdkrecuzczcho.supabase.co
```

```
DB_PORT=5432
```

```
DB_USERNAME=postgres
```

```
DB_PASSWORD=1412Moon@
```

```
DB_DATABASE=postgres
```

```
JWT_SECRET=your-super-secret-key-change-this-to-random-string-at-least-32-chars
```

```
JWT_EXPIRES_IN=7d
```

```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

```
CLOUDINARY_API_KEY=your-cloudinary-api-key
```

```
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### ขั้นตอนที่ 3: สร้าง JWT Secret

ใช้คำสั่งนี้เพื่อสร้าง JWT Secret ที่ปลอดภัย:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

หรือใช้ online generator: https://generate-secret.vercel.app/32

### ขั้นตอนที่ 4: ตั้งค่า Cloudinary

1. ไปที่ https://cloudinary.com และสมัครบัญชี (ฟรี)
2. ไปที่ Dashboard
3. คัดลอก:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
4. นำมาใส่ใน Railway Environment Variables

### ขั้นตอนที่ 5: Redeploy

หลังจากตั้งค่า environment variables เสร็จแล้ว:
1. คลิก **"Deploy"** ใหม่
2. รอ deployment เสร็จ
3. ตรวจสอบ logs ว่า backend เชื่อมต่อ database ได้

---

## ตัวอย่าง Environment Variables (สำหรับ copy-paste)

**สำหรับ Railway (ใช้ Supabase Database):**

```
PORT=3001
DB_TYPE=postgres
DB_HOST=db.ndpdncfzdkrecuzczcho.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=1412Moon@
DB_DATABASE=postgres
JWT_SECRET=<generate-random-32-char-string>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
```

**หมายเหตุ:**
- ใช้ Supabase database ที่มีอยู่แล้ว ไม่ต้องสร้างใหม่ใน Railway
- Database credentials เหมือนกับที่ใช้ใน local development
- ตรวจสอบว่า Supabase อนุญาตให้ Railway IP เชื่อมต่อได้ (โดยปกติ Supabase อนุญาตทุก IP)

---

## การตรวจสอบว่าตั้งค่าถูกต้อง

1. ไปที่ Backend service → **Deployments**
2. คลิกที่ deployment ล่าสุด
3. ดู **Deploy Logs**
4. ควรเห็น:
   ```
   [Nest] LOG [NestFactory] Starting Nest application...
   [Nest] LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized
   Backend running on http://localhost:3001
   ```

5. ถ้าเห็น error เกี่ยวกับ database connection:
   - ตรวจสอบว่า DB_* variables ถูกต้อง
   - ตรวจสอบว่า PostgreSQL service กำลังรันอยู่

---

## Troubleshooting

### Error: "Cannot connect to database"
- ตรวจสอบว่า PostgreSQL service กำลังรันอยู่
- ตรวจสอบว่า DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD ถูกต้อง
- ลอง redeploy PostgreSQL service

### Error: "JWT secret is required"
- ตรวจสอบว่าตั้งค่า JWT_SECRET แล้ว
- JWT_SECRET ต้องมีความยาวอย่างน้อย 32 ตัวอักษร

### Error: "Cloudinary configuration is invalid"
- ตรวจสอบว่าตั้งค่า CLOUDINARY_* ครบทั้ง 3 ตัว
- ตรวจสอบว่าค่าที่ใส่ถูกต้อง (ไม่มีช่องว่างหรือตัวอักษรพิเศษ)

---

## ขั้นตอนถัดไป

หลังจาก backend deploy สำเร็จแล้ว:

1. คัดลอก **Backend URL** จาก Railway (Settings → Domains)
2. ไปตั้งค่า Frontend ใน Vercel:
   - Environment Variable: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.railway.app`
3. Redeploy frontend ใน Vercel

เสร็จแล้ว! 🎉
