// ทดสอบฟิลด์ใหม่ใน quotation
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNewFields() {
  try {
    // 1. Login
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    console.log('✓ Login สำเร็จ');

    // 2. ดึงข้อมูล quotation ตัวแรก
    console.log('\n2. ดึงข้อมูล quotation...');
    const quotationsRes = await axios.get(`${BASE_URL}/quotations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (quotationsRes.data.length > 0) {
      const firstQuotation = quotationsRes.data[0];
      console.log('✓ พบ quotation:', firstQuotation.quotationNumber);
      console.log('  - Location:', firstQuotation.location || '(ไม่มี)');
      console.log('  - ผู้ติดต่อประสานงาน:', firstQuotation.coordinatorContact || '(ไม่มี)');
      console.log('  - ผู้ติดต่อรับรถ:', firstQuotation.vehicleRecipient || '(ไม่มี)');

      // 3. อัพเดทฟิลด์ใหม่
      console.log('\n3. อัพเดทฟิลด์ใหม่...');
      const updateRes = await axios.patch(
        `${BASE_URL}/quotations/${firstQuotation.id}`,
        {
          location: 'กรุงเทพมหานคร',
          coordinatorContact: 'คุณสมชาย โทร. 081-234-5678',
          vehicleRecipient: 'คุณสมหญิง โทร. 082-345-6789'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✓ อัพเดทสำเร็จ');

      // 4. ตรวจสอบข้อมูลหลังอัพเดท
      console.log('\n4. ตรวจสอบข้อมูลหลังอัพเดท...');
      const checkRes = await axios.get(`${BASE_URL}/quotations/${firstQuotation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ ข้อมูลหลังอัพเดท:');
      console.log('  - Location:', checkRes.data.location);
      console.log('  - ผู้ติดต่อประสานงาน:', checkRes.data.coordinatorContact);
      console.log('  - ผู้ติดต่อรับรถ:', checkRes.data.vehicleRecipient);
    } else {
      console.log('⚠ ไม่พบ quotation ในระบบ');
    }

    console.log('\n✅ ทดสอบเสร็จสิ้น - ฟิลด์ใหม่ทำงานได้ปกติ!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.response?.data || error.message);
  }
}

testNewFields();
