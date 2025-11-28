-- อัพเดท quotations ที่ไม่มี statusSale ให้เป็น "อยู่ระหว่างการพิจารณา" (ID = 1)
UPDATE quotations 
SET statusSaleId = 1 
WHERE statusSaleId IS NULL;

-- ตรวจสอบผลลัพธ์
SELECT 
  COUNT(*) as total_quotations,
  SUM(CASE WHEN statusSaleId IS NULL THEN 1 ELSE 0 END) as null_status,
  SUM(CASE WHEN statusSaleId = 1 THEN 1 ELSE 0 END) as default_status
FROM quotations;
