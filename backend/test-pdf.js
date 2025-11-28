// ทดสอบ PDF parser
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testPdf() {
  try {
    // ตรวจสอบว่ามีไฟล์หรือไม่
    const pdfPath = path.join(__dirname, '..', 'test-job-order.pdf');
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ ไม่พบไฟล์ test-job-order.pdf ในโฟลเดอร์หลัก');
      console.log('   กรุณาวางไฟล์ PDF ในโฟลเดอร์ BG-MST');
      return;
    }

    console.log('📄 กำลังอ่านไฟล์:', pdfPath);
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('🔄 กำลัง parse PDF...');
    const data = await pdf(dataBuffer);
    
    console.log('\n✅ อ่านสำเร็จ!');
    console.log('จำนวนหน้า:', data.numpages);
    console.log('จำนวนข้อความ:', data.text.length, 'ตัวอักษร');
    console.log('\n📝 ข้อความทั้งหมด:');
    console.log('='.repeat(80));
    console.log(data.text);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testPdf();
