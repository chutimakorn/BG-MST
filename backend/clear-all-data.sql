-- ลบข้อมูลทั้งหมด (ระวัง! จะลบข้อมูลทั้งหมดยกเว้น users)

-- ลบ quotations
DELETE FROM quotations;

-- ลบ master data (ถ้าต้องการ)
-- DELETE FROM sale_members;
-- DELETE FROM cars;
-- DELETE FROM category_cars;
-- DELETE FROM body_colors;
-- DELETE FROM seat_colors;
-- DELETE FROM canopy_colors;
-- DELETE FROM provinces;
-- DELETE FROM status_sales;
-- DELETE FROM status_jobs;
-- DELETE FROM status_job_documents;

-- Reset auto increment
DELETE FROM sqlite_sequence WHERE name='quotations';
-- DELETE FROM sqlite_sequence WHERE name='sale_members';
-- DELETE FROM sqlite_sequence WHERE name='cars';
-- DELETE FROM sqlite_sequence WHERE name='category_cars';
-- DELETE FROM sqlite_sequence WHERE name='body_colors';
-- DELETE FROM sqlite_sequence WHERE name='seat_colors';
-- DELETE FROM sqlite_sequence WHERE name='canopy_colors';
-- DELETE FROM sqlite_sequence WHERE name='provinces';
-- DELETE FROM sqlite_sequence WHERE name='status_sales';
-- DELETE FROM sqlite_sequence WHERE name='status_jobs';
-- DELETE FROM sqlite_sequence WHERE name='status_job_documents';

-- แสดงจำนวนข้อมูลที่เหลือ
SELECT 'Quotations' as table_name, COUNT(*) as count FROM quotations
UNION ALL
SELECT 'Sale Members', COUNT(*) FROM sale_members
UNION ALL
SELECT 'Cars', COUNT(*) FROM cars
UNION ALL
SELECT 'Users', COUNT(*) FROM users;
