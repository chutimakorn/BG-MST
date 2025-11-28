// ทดสอบ upload PDF และดึงข้อมูล
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';

async function testPdfUpload() {
  try {
    console.log('🔄 ทดสอบ PDF Upload...\n');

    // 1. Login
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    console.log('✓ Login สำเร็จ\n');

    // 2. Upload PDF (ต้องมีไฟล์ PDF ในโฟลเดอร์)
    console.log('2. Upload PDF...');
    
    // ตรวจสอบว่ามีไฟล์ PDF หรือไม่
    const pdfPath = './test-job-order.pdf';
    if (!fs.existsSync(pdfPath)) {
      console.log('⚠️  ไม่พบไฟล์ test-job-order.pdf');
      console.log('   กรุณาวางไฟล์ PDF ที่ต้องการทดสอบในโฟลเดอร์นี้และตั้งชื่อเป็น test-job-order.pdf');
      return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));

    const response = await axios.post(`${BASE_URL}/import/pdf`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✓ อ่าน PDF สำเร็จ\n');
    console.log('📄 ข้อมูลที่ดึงได้:');
    console.log(JSON.stringify(response.data.extracted, null, 2));

    console.log('\n📝 Raw Text (100 ตัวอักษรแรก):');
    console.log(response.data.rawText.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.response?.data || error.message);
  }
}

testPdfUpload();
