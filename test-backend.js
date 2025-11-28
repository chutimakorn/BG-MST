// ทดสอบ Backend API
const API_URL = 'http://localhost:3001';

async function test() {
  console.log('=== ทดสอบ Backend API ===\n');

  // 1. Login
  console.log('1. ทดสอบ Login...');
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  
  const loginData = await loginResponse.json();
  console.log('Login Status:', loginResponse.status);
  console.log('Login Response:', loginData);
  
  if (!loginData.access_token) {
    console.error('❌ ไม่ได้ token!');
    return;
  }
  
  const token = loginData.access_token;
  console.log('✅ ได้ token แล้ว:', token.substring(0, 30) + '...\n');

  // 2. Initialize Master Data
  console.log('2. ทดสอบ Initialize Master Data...');
  const initResponse = await fetch(`${API_URL}/master-data/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Initialize Status:', initResponse.status);
  const initData = await initResponse.json();
  console.log('Initialize Response:', initData);
  
  if (initResponse.status === 401) {
    console.error('❌ ได้ 401 Unauthorized!');
    return;
  }
  
  console.log('✅ Initialize สำเร็จ!\n');

  // 3. Get Cars
  console.log('3. ทดสอบดูข้อมูลรถ...');
  const carsResponse = await fetch(`${API_URL}/master-data/cars`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Cars Status:', carsResponse.status);
  const carsData = await carsResponse.json();
  console.log('จำนวนรถ:', carsData.length);
  console.log('รถ 3 คันแรก:', carsData.slice(0, 3));
  
  console.log('\n✅ ทดสอบเสร็จสิ้น!');
}

test().catch(console.error);
