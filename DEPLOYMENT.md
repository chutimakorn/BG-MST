# คู่มือการ Deploy โปรเจค

## 1. Deploy Frontend บน Vercel

### ขั้นตอน:

1. **Push โค้ดขึ้น GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **เข้า Vercel Dashboard**
   - ไปที่ https://vercel.com
   - Login ด้วย GitHub
   - คลิก "Add New Project"
   - เลือก repository ของคุณ

3. **ตั้งค่า Project**
   - Root Directory: `frontend`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **ตั้งค่า Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

5. **Deploy**
   - คลิก "Deploy"
   - รอ build เสร็จ (ประมาณ 2-3 นาที)

---

## 2. Deploy Backend บน Railway (แนะนำ)

### ขั้นตอน:

1. **เข้า Railway Dashboard**
   - ไปที่ https://railway.app
   - Login ด้วย GitHub
   - คลิก "New Project"
   - เลือก "Deploy from GitHub repo"

2. **เลือก Repository และ Root Directory**
   - เลือก repository
   - ตั้ง Root Directory: `backend`

3. **ตั้งค่า Environment Variables**
   ```
   DB_TYPE=postgres
   DB_HOST=<railway-postgres-host>
   DB_PORT=5432
   DB_USERNAME=<railway-postgres-user>
   DB_PASSWORD=<railway-postgres-password>
   DB_DATABASE=<railway-postgres-db>
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRES_IN=7d
   PORT=3001
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
   CLOUDINARY_API_KEY=<your-cloudinary-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-secret>
   ```

4. **เพิ่ม PostgreSQL Database**
   - ใน Railway project คลิก "New"
   - เลือก "Database" → "PostgreSQL"
   - Railway จะสร้าง database และ connection string ให้อัตโนมัติ

5. **Deploy**
   - Railway จะ auto-deploy เมื่อ push code
   - รอ build เสร็จ (ประมาณ 3-5 นาที)

6. **ดู Backend URL**
   - ไปที่ Settings → Domains
   - คัดลอก URL (เช่น `https://your-app.railway.app`)
   - นำ URL นี้ไปใส่ใน Vercel Environment Variables

---

## 3. Deploy Backend บน Render (ทางเลือก)

### ขั้นตอน:

1. **เข้า Render Dashboard**
   - ไปที่ https://render.com
   - Login ด้วย GitHub
   - คลิก "New +" → "Web Service"

2. **เชื่อมต่อ Repository**
   - เลือก repository
   - ตั้ง Root Directory: `backend`

3. **ตั้งค่า Build**
   - Name: `bg-mst-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

4. **เลือก Plan**
   - Free tier (มีข้อจำกัด)
   - หรือ Starter ($7/month)

5. **ตั้งค่า Environment Variables**
   (เหมือนกับ Railway)

6. **สร้าง PostgreSQL Database**
   - คลิก "New +" → "PostgreSQL"
   - เลือก plan
   - คัดลอก connection string

7. **Deploy**
   - คลิก "Create Web Service"
   - รอ build เสร็จ

---

## 4. อัพเดท Frontend Environment Variables

หลังจาก deploy backend เสร็จแล้ว:

1. ไปที่ Vercel Dashboard
2. เลือก project
3. ไปที่ Settings → Environment Variables
4. อัพเดท `NEXT_PUBLIC_API_URL` เป็น backend URL ที่ได้
5. Redeploy frontend

---

## 5. ตรวจสอบการทำงาน

### Frontend:
- เปิด URL ที่ Vercel ให้มา
- ทดสอบ login
- ตรวจสอบว่าเชื่อมต่อ backend ได้

### Backend:
- เปิด `https://your-backend-url.com/health` (ถ้ามี health check endpoint)
- ทดสอบ API endpoints

---

## 6. การอัพเดทโค้ด

### Frontend:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel จะ auto-deploy

### Backend:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Railway/Render จะ auto-deploy

---

## 7. Troubleshooting

### Frontend ไม่เชื่อมต่อ Backend:
- ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน Vercel
- ตรวจสอบ CORS settings ใน backend

### Backend Error:
- ดู logs ใน Railway/Render dashboard
- ตรวจสอบ environment variables
- ตรวจสอบ database connection

### Database Migration:
```bash
# Connect to production database
npm run typeorm migration:run
```

---

## 8. Security Checklist

- [ ] เปลี่ยน JWT_SECRET เป็นค่าที่ปลอดภัย
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] ใช้ HTTPS ทั้ง frontend และ backend
- [ ] ซ่อน sensitive data ใน environment variables
- [ ] Enable rate limiting
- [ ] ตั้งค่า database backup

---

## 9. Monitoring

### Vercel:
- Analytics: ดูจำนวน visitors
- Logs: ดู build logs และ runtime logs

### Railway/Render:
- Metrics: ดู CPU, Memory usage
- Logs: ดู application logs
- Alerts: ตั้งค่า alerts สำหรับ errors

---

## 10. Cost Estimation

### Free Tier:
- Vercel: Free (Hobby plan)
- Railway: $5 credit/month
- Render: Free (มีข้อจำกัด)
- Supabase: Free (มีข้อจำกัด)

### Paid Plans:
- Vercel Pro: $20/month
- Railway: Pay as you go (~$5-20/month)
- Render Starter: $7/month
- Supabase Pro: $25/month

---

## ติดต่อ Support

หากมีปัญหาในการ deploy:
1. ตรวจสอบ logs ใน platform dashboard
2. อ่าน documentation ของแต่ละ platform
3. ถาม AI หรือ community forums
