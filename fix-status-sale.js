// อัพเดท statusSale ที่เป็น null ให้เป็น "อยู่ระหว่างการพิจารณา"
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function fixStatusSale() {
  try {
    console.log('🔄 กำลังแก้ไข statusSale...\n');

    // 1. Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    console.log('✓ Login สำเร็จ\n');

    // 2. ดึง statusSale "อยู่ระหว่างการพิจารณา"
    const statusRes = await axios.get(`${BASE_URL}/master-data/status-sales`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const defaultStatus = statusRes.data.find(s => s.name === 'อยู่ระหว่างการพิจารณา');
    if (!defaultStatus) {
      console.error('❌ ไม่พบ status "อยู่ระหว่างการพิจารณา"');
      return;
    }
    console.log(`✓ พบ default status: ${defaultStatus.name} (ID: ${defaultStatus.id})\n`);

    // 3. ดึง quotations ทั้งหมด
    const quotationsRes = await axios.get(`${BASE_URL}/quotations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const quotations = quotationsRes.data;
    console.log(`✓ พบ ${quotations.length} quotations\n`);

    // 4. อัพเดท quotations ที่ไม่มี statusSale
    let updated = 0;
    let skipped = 0;

    for (const quotation of quotations) {
      if (!quotation.statusSale) {
        try {
          // ใช้ PUT และส่งข้อมูลทั้งหมดกลับไป
          const updateData = {
            ...quotation,
            statusSaleId: defaultStatus.id,
            saleMemberId: quotation.saleMember?.id || null,
            carId: quotation.car?.id || null,
            categoryCarId: quotation.categoryCar?.id || null,
            bodyColorId: quotation.bodyColor?.id || null,
            seatColorId: quotation.seatColor?.id || null,
            canopyColorId: quotation.canopyColor?.id || null,
            provinceId: quotation.province?.id || null,
            statusJobId: quotation.statusJob?.id || null,
            statusJobDocumentId: quotation.statusJobDocument?.id || null,
          };
          
          // ลบ relations objects ออก
          delete updateData.saleMember;
          delete updateData.car;
          delete updateData.categoryCar;
          delete updateData.bodyColor;
          delete updateData.seatColor;
          delete updateData.canopyColor;
          delete updateData.province;
          delete updateData.statusSale;
          delete updateData.statusJob;
          delete updateData.statusJobDocument;
          delete updateData.createdAt;
          delete updateData.updatedAt;
          
          await axios.put(
            `${BASE_URL}/quotations/${quotation.id}`,
            updateData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updated++;
          process.stdout.write(`\r   อัพเดทแล้ว: ${updated}/${quotations.length}`);
        } catch (error) {
          console.error(`\n   ❌ ไม่สามารถอัพเดท ${quotation.quotationNumber}: ${error.response?.data?.message || error.message}`);
        }
      } else {
        skipped++;
      }
    }

    console.log('\n');
    console.log('✅ เสร็จสิ้น!');
    console.log(`   - อัพเดท: ${updated} รายการ`);
    console.log(`   - ข้าม (มี status อยู่แล้ว): ${skipped} รายการ`);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.response?.data || error.message);
  }
}

fixStatusSale();
