// สคริปต์เคลียร์ข้อมูล quotations ผ่าน API
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function clearQuotations() {
  try {
    console.log('🔄 กำลังเคลียร์ข้อมูล quotations...\n');

    // 1. Login
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    console.log('✓ Login สำเร็จ\n');

    // 2. ดึงข้อมูล quotations ทั้งหมด
    console.log('2. ดึงข้อมูล quotations...');
    const quotationsRes = await axios.get(`${BASE_URL}/quotations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const quotations = quotationsRes.data;
    console.log(`✓ พบ ${quotations.length} quotations\n`);

    if (quotations.length === 0) {
      console.log('ℹ️  ไม่มีข้อมูลที่ต้องลบ');
      return;
    }

    // 3. ลบทีละรายการ
    console.log('3. กำลังลบข้อมูล...');
    let deleted = 0;
    let failed = 0;

    for (const quotation of quotations) {
      try {
        await axios.delete(`${BASE_URL}/quotations/${quotation.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        deleted++;
        process.stdout.write(`\r   ลบแล้ว: ${deleted}/${quotations.length}`);
      } catch (error) {
        failed++;
        console.error(`\n   ❌ ลบไม่สำเร็จ: ${quotation.quotationNumber}`);
      }
    }

    console.log('\n');
    console.log('✅ เคลียร์ข้อมูลเสร็จสิ้น!');
    console.log(`   - ลบสำเร็จ: ${deleted} รายการ`);
    if (failed > 0) {
      console.log(`   - ลบไม่สำเร็จ: ${failed} รายการ`);
    }

    // 4. ตรวจสอบข้อมูลที่เหลือ
    console.log('\n4. ตรวจสอบข้อมูลที่เหลือ...');
    const checkRes = await axios.get(`${BASE_URL}/quotations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✓ เหลือข้อมูล: ${checkRes.data.length} quotations`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.response?.data || error.message);
  }
}

// ถามยืนยันก่อนลบ
console.log('⚠️  คำเตือน: คุณกำลังจะลบข้อมูล quotations ทั้งหมด!');
console.log('กด Ctrl+C เพื่อยกเลิก หรือรอ 3 วินาทีเพื่อดำเนินการต่อ...\n');

setTimeout(() => {
  clearQuotations();
}, 3000);
