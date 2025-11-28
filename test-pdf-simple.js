// ทดสอบ PDF parser แบบง่าย
const pdfParse = require('./backend/node_modules/pdf-parse');
const fs = require('fs');

async function testPdf() {
  try {
    // ตรวจสอบว่ามีไฟล์หรือไม่
    const pdfPath = './test-job-order.pdf';
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ ไม่พบไฟล์ test-job-order.pdf');
      console.log('   กรุณาวางไฟล์ PDF ในโฟลเดอร์นี้');
      return;
    }

    console.log('📄 กำลังอ่านไฟล์...');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('🔄 กำลัง parse PDF...');
    const data = await pdfParse(dataBuffer);
    
    console.log('\n✅ อ่านสำเร็จ!');
    console.log('จำนวนหน้า:', data.numpages);
    console.log('จำนวนข้อความ:', data.text.length, 'ตัวอักษร');
    console.log('\n📝 ข้อความ 500 ตัวอักษรแรก:');
    console.log(data.text.substring(0, 500));
    console.log('\n...');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testPdf();
