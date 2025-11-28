// สร้างข้อมูลทดสอบสำหรับ reports
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function createTestData() {
  try {
    console.log('🔄 กำลังสร้างข้อมูลทดสอบ...\n');

    // 1. Login
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    console.log('✓ Login สำเร็จ\n');

    // 2. สร้าง quotations ทดสอบ
    console.log('2. สร้างข้อมูล quotations...');
    
    const testQuotations = [
      {
        quotationNumber: 'TEST-001',
        customerName: 'บริษัท ทดสอบ 1 จำกัด',
        customerCode: 'C001',
        customerGroup: 'G',
        quantity: 5,
        pricePerUnitWithVat: 500000,
        submissionDate: '2024-01-15',
      },
      {
        quotationNumber: 'TEST-002',
        customerName: 'บริษัท ทดสอบ 2 จำกัด',
        customerCode: 'C002',
        customerGroup: 'G',
        quantity: 3,
        pricePerUnitWithVat: 450000,
        submissionDate: '2024-02-20',
      },
      {
        quotationNumber: 'TEST-003',
        customerName: 'บริษัท ทดสอบ 3 จำกัด',
        customerCode: 'C003',
        customerGroup: 'NG',
        quantity: 10,
        pricePerUnitWithVat: 480000,
        submissionDate: '2024-03-10',
      },
    ];

    let created = 0;
    for (const quotation of testQuotations) {
      try {
        await axios.post(`${BASE_URL}/quotations`, quotation, {
          headers: { Authorization: `Bearer ${token}` }
        });
        created++;
        console.log(`   ✓ สร้าง ${quotation.quotationNumber}`);
      } catch (error) {
        console.log(`   ✗ ไม่สามารถสร้าง ${quotation.quotationNumber}: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log(`\n✅ สร้างข้อมูลเสร็จสิ้น: ${created}/${testQuotations.length} รายการ\n`);

    // 3. ทดสอบ reports
    console.log('3. ทดสอบ reports...');
    const reportRes = await axios.get(`${BASE_URL}/reports/sales-summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Reports:', JSON.stringify(reportRes.data, null, 2));

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.response?.data || error.message);
  }
}

createTestData();
