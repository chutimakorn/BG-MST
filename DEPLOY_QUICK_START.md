# 🚀 Quick Start - Deploy to Production

## ขั้นตอนย่อสำหรับการ Deploy

### 1️⃣ เตรียม Code
```bash
# Commit code ทั้งหมด
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2️⃣ Deploy Backend (Railway - แนะนำ)

1. ไปที่ https://railway.app และ Login
2. คลิก **"New Project"** → **"Deploy from GitHub repo"**
3. เลือก repository และตั้ง **Root Directory: `backend`**
4. เพิ่ม **PostgreSQL Database**:
   - คลิก "New" → "Database" → "PostgreSQL"
5. ตั้งค่า **Environment Variables**:
   ```
   PORT=3001
   JWT_SECRET=your-super-secret-key-change-this
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   ```
   (Database variables จะถูกตั้งค่าอัตโนมัติ)

6. รอ deploy เสร็จ (~3-5 นาที)
7. คัดลอก **Backend URL** จาก Settings → Domains

### 3️⃣ Deploy Frontend (Vercel)

1. ไปที่ https://vercel.com และ Login
2. คลิก **"Add New Project"**
3. เลือก repository
4. ตั้งค่า:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
5. เพิ่ม **Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
   (ใส่ Backend URL ที่ได้จากขั้นตอนที่ 2)

6. คลิก **"Deploy"**
7. รอ build เสร็จ (~2-3 นาที)

### 4️⃣ ทดสอบ

1. เปิด Frontend URL ที่ Vercel ให้มา
2. ทดสอบ Login
3. ทดสอบสร้างใบเสนอราคา
4. ตรวจสอบว่าทุกอย่างทำงานได้

---

## 🔧 การอัพเดทโค้ด

```bash
# แก้ไขโค้ด
git add .
git commit -m "Update features"
git push origin main
```

Railway และ Vercel จะ **auto-deploy** ให้อัตโนมัติ!

---

## ⚠️ สิ่งที่ต้องเช็คก่อน Deploy

- [ ] เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัย
- [ ] ตั้งค่า Cloudinary credentials
- [ ] ตรวจสอบว่า database เป็น PostgreSQL (ไม่ใช่ SQLite)
- [ ] ทดสอบ API endpoints ทั้งหมด
- [ ] ตรวจสอบ CORS settings

---

## 💰 ค่าใช้จ่าย (Estimate)

- **Vercel**: ฟรี (Hobby plan)
- **Railway**: ~$5-10/month (Pay as you go)
- **Supabase/PostgreSQL**: ฟรี (Free tier) หรือ $25/month (Pro)
- **Cloudinary**: ฟรี (Free tier)

**รวม**: ~$5-10/month สำหรับ production

---

## 📞 ต้องการความช่วยเหลือ?

อ่านเพิ่มเติมใน `DEPLOYMENT.md` สำหรับรายละเอียดทั้งหมด
