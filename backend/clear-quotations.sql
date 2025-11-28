-- ลบข้อมูล quotations ทั้งหมด
DELETE FROM quotations;

-- Reset auto increment (ถ้าต้องการให้ ID เริ่มใหม่จาก 1)
DELETE FROM sqlite_sequence WHERE name='quotations';

-- แสดงจำนวนข้อมูลที่เหลือ
SELECT COUNT(*) as remaining_quotations FROM quotations;
