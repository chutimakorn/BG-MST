# วิธีปรับปรุงการอ่าน PDF ให้แม่นยำขึ้น

## วิธีที่ 1: ใช้ OCR (Tesseract.js)
สำหรับ PDF ที่เป็นรูปภาพหรือ scanned

### ติดตั้ง:
```bash
npm install tesseract.js pdf2pic --prefix backend
```

### ข้อดี:
- อ่าน PDF ที่เป็นรูปภาพได้
- รองรับภาษาไทยและอังกฤษ
- แม่นยำกว่าสำหรับ scanned documents

### ข้อเสีย:
- ช้ากว่า (ใช้เวลา 5-10 วินาที)
- ต้องติดตั้ง dependencies เพิ่ม

---

## วิธีที่ 2: ใช้ AI/LLM (OpenAI, Claude)
ส่ง PDF text ให้ AI วิเคราะห์และดึงข้อมูล

### ติดตั้ง:
```bash
npm install openai --prefix backend
```

### ข้อดี:
- แม่นยำมาก (90-95%)
- เข้าใจ context ได้ดี
- ไม่ต้องเขียน regex ซับซ้อน

### ข้อเสีย:
- ต้องมี API key (มีค่าใช้จ่าย)
- ช้ากว่า (2-5 วินาที)
- ต้องส่งข้อมูลออกนอก server

---

## วิธีที่ 3: ปรับปรุง Regex Pattern
ปรับปรุง pattern matching ให้แม่นยำขึ้น

### ข้อดี:
- ฟรี ไม่มีค่าใช้จ่าย
- เร็วมาก
- ไม่ต้องติดตั้งอะไรเพิ่ม

### ข้อเสีย:
- ต้องปรับแต่งตาม format ของ PDF แต่ละแบบ
- ถ้า format เปลี่ยนต้องแก้ code

---

## วิธีที่ 4: ใช้ PDF.js (Mozilla)
Parse PDF structure โดยตรง

### ข้อดี:
- แม่นยำสำหรับ PDF ที่มี structure ดี
- อ่าน metadata ได้

### ข้อเสีย:
- ซับซ้อนกว่า
- ต้องเข้าใจ PDF structure

---

## คำแนะนำ:

### สำหรับ PDF ที่เป็น text-based (แบบคุณ):
✅ **วิธีที่ 3: ปรับปรุง Regex** (แนะนำ)
- เร็ว ฟรี และเพียงพอ
- ปรับแต่ง pattern ให้ตรงกับ format ของคุณ

### สำหรับ PDF ที่เป็นรูปภาพ:
✅ **วิธีที่ 1: OCR** (แนะนำ)
- จำเป็นต้องใช้ OCR

### สำหรับความแม่นยำสูงสุด:
✅ **วิธีที่ 2: AI/LLM** (แนะนำ)
- แม่นยำที่สุด แต่มีค่าใช้จ่าย

---

## ตัวอย่างการใช้ AI (OpenAI)

```typescript
import OpenAI from 'openai';

async function extractWithAI(pdfText: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "user",
      content: `Extract the following information from this Job Order in JSON format:
      - Job No
      - Date
      - Customer Name
      - Delivery Place
      - Delivery Date
      - Car Model
      - Quantity
      - Colors (Body, Seat, Canopy)
      - Price
      - Total
      
      Text:
      ${pdfText}
      
      Return only valid JSON.`
    }],
    temperature: 0
  });

  return JSON.parse(response.choices[0].message.content);
}
```

ค่าใช้จ่าย: ~$0.01-0.03 ต่อครั้ง
