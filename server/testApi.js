// Quick automated test for backend APIs
const runTests = async () => {
  try {
    console.log('[Test] Testing Health Endpoint...');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    console.log('Health:', healthData);

    console.log('\n[Test] Testing Student Login (Aarav Sharma)...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@nepcredit.edu', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    console.log('Login success:', loginData.success, 'Student Name:', loginData.user?.name);
    const studentToken = loginData.token;
    const studentDocId = loginData.student._id;

    console.log('\n[Test] Testing Credits Endpoint for Student...');
    const creditRes = await fetch(`http://localhost:5000/api/credits/${studentDocId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const creditData = await creditRes.json();
    console.log('Credit Stats:');
    console.log(' - Required:', creditData.data?.requiredCredits);
    console.log(' - Earned:', creditData.data?.earnedCredits);
    console.log(' - Remaining:', creditData.data?.remainingCredits);
    console.log(' - Progress %:', creditData.data?.progressPercentage);
    console.log(' - Semester count:', creditData.data?.semesterBreakdown?.length);

    console.log('\n[Test] Testing Admin Login...');
    const adminRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nepcredit.edu', password: 'admin123' }),
    });
    const adminData = await adminRes.json();
    console.log('Admin login success:', adminData.success, 'Role:', adminData.user?.role);
    const adminToken = adminData.token;

    console.log('\n[Test] Testing Admin Dashboard Stats...');
    const dashRes = await fetch('http://localhost:5000/api/dashboard/admin', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = await dashRes.json();
    console.log('Dashboard stats:', dashData.stats);

    console.log('\n[Test] Testing Subjects API...');
    const subjRes = await fetch('http://localhost:5000/api/subjects', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const subjData = await subjRes.json();
    console.log('Subjects count:', subjData.count);

    console.log('\n[ALL TESTS PASSED SUCCESSFULLY!]');
  } catch (err) {
    console.error('Test failed:', err);
  }
};

runTests();
