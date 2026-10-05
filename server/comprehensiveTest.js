const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  ${colors.green}✓ [PASS]${colors.reset} ${testName} ${details ? colors.cyan + '(' + details + ')' + colors.reset : ''}`);
  } else {
    failed++;
    console.log(`  ${colors.red}✗ [FAIL]${colors.reset} ${testName} ${details ? colors.yellow + '(' + details + ')' + colors.reset : ''}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log(`\n${colors.bold}${colors.blue}========================================================================${colors.reset}`);
  console.log(`${colors.bold}   STUDENT NEP CREDIT TRACKER - COMPREHENSIVE END-TO-END TEST SUITE${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}========================================================================${colors.reset}\n`);

  let adminToken = '';
  let studentToken = '';
  let studentDocId = '';
  let testSubjectId = '';
  let testStudentId = '';
  let testStudentSubjectId = '';

  // ---------------------------------------------------------
  // 1. HEALTH & CONNECTIVITY
  // ---------------------------------------------------------
  console.log(`${colors.bold}1. Health & Server Status${colors.reset}`);
  const health = await request('/health');
  assert(health.status === 200, 'Health endpoint responds with HTTP 200');
  assert(health.data?.status === 'OK', 'Health status is OK');

  // ---------------------------------------------------------
  // 2. AUTHENTICATION & RBAC
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}2. Authentication & Authorization (JWT & Roles)${colors.reset}`);

  // Admin Login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nepcredit.edu', password: 'admin123' }),
  });
  assert(adminLogin.status === 200, 'Admin login credentials valid');
  assert(adminLogin.data?.user?.role === 'admin', 'Admin role recognized', adminLogin.data?.user?.name);
  assert(!!adminLogin.data?.token, 'JWT token returned for Admin');
  adminToken = adminLogin.data?.token;

  // Student Login (Aarav Sharma)
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@nepcredit.edu', password: 'student123' }),
  });
  assert(studentLogin.status === 200, 'Student login credentials valid');
  assert(studentLogin.data?.user?.role === 'student', 'Student role recognized', studentLogin.data?.user?.name);
  assert(!!studentLogin.data?.student?._id, 'Student profile attached to login');
  studentToken = studentLogin.data?.token;
  studentDocId = studentLogin.data?.student?._id;

  // Bad Credentials Test
  const badLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fake@nepcredit.edu', password: 'wrong' }),
  });
  assert(badLogin.status === 401, 'Bad credentials return HTTP 401 Unauthorized');

  // Protected /auth/me without token
  const noTokenMe = await request('/auth/me');
  assert(noTokenMe.status === 401, 'Endpoint /api/auth/me rejects unauthenticated request');

  // Protected /auth/me with Student token
  const studentMe = await request('/auth/me', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(studentMe.status === 200, 'Student token authorized on /api/auth/me');
  assert(studentMe.data?.student?.studentId === 'STU2024001', 'Correct student profile retrieved');

  // Student Self-Registration
  const randomRoll = `REG-TEST-${Date.now().toString().slice(-4)}`;
  const regRes = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Registration Test Student',
      email: `test.${Date.now()}@nepcredit.edu`,
      password: 'password123',
      rollNumber: randomRoll,
      course: 'M.Sc. Computer Science',
      department: 'Computer Science',
    }),
  });
  assert(regRes.status === 201, 'Student self-registration creates account with HTTP 201');
  assert(regRes.data?.user?.role === 'student', 'Registered account is assigned student role');

  // ---------------------------------------------------------
  // 3. NEP CREDIT ENGINE MATHEMATICAL AUDIT
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}3. NEP Credit Engine Mathematical Calculations${colors.reset}`);

  // Test Aarav Sharma: 52 Earned / 80 Required (65%)
  const aaravCredits = await request(`/credits/${studentDocId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(aaravCredits.status === 200, 'Credit engine endpoint responds for Student');
  const d = aaravCredits.data?.data;
  assert(d?.requiredCredits === 80, 'Required Credits = 80', `${d?.requiredCredits}`);
  assert(d?.earnedCredits === 52, 'Earned Credits = 52 (Formula: Sum of completed)', `${d?.earnedCredits}`);
  assert(d?.remainingCredits === 28, 'Remaining Credits = 28 (Formula: 80 - 52)', `${d?.remainingCredits}`);
  assert(d?.progressPercentage === 65, 'Progress Percentage = 65% (Formula: (52/80)*100)', `${d?.progressPercentage}%`);
  assert(d?.isRequirementCompleted === false, 'Requirement completed flag = false for 65%');
  assert(d?.semesterBreakdown?.length === 4, 'Semester breakdown contains 4 semesters');

  // Check Semester 1: 20 / 24 Credits
  const sem1 = d?.semesterBreakdown?.find((s) => s.semester === 1);
  assert(sem1?.earnedCredits === 20, 'Semester 1 Earned = 20 Credits', `${sem1?.earnedCredits}/${sem1?.totalCredits}`);

  // Check Priya Patel: 80 / 80 Credits (100% Completed)
  const priyaLogin = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.patel@nepcredit.edu', password: 'student123' }),
  });
  const priyaCredits = await request(`/credits/${priyaLogin.data?.student?._id}`, {
    headers: { Authorization: `Bearer ${priyaLogin.data?.token}` },
  });
  const pd = priyaCredits.data?.data;
  assert(pd?.earnedCredits === 80, 'Priya Patel has 80 Earned Credits', `${pd?.earnedCredits}`);
  assert(pd?.remainingCredits === 0, 'Remaining Credits = 0 (No negative remaining credits)', `${pd?.remainingCredits}`);
  assert(pd?.progressPercentage === 100, 'Progress = 100%', `${pd?.progressPercentage}%`);
  assert(pd?.isRequirementCompleted === true, 'Degree status flag = isRequirementCompleted: true');

  // Credit History
  const historyRes = await request(`/credits/${studentDocId}/history`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(historyRes.status === 200, 'Credit history endpoint returns audited completion log');
  assert(historyRes.data?.history?.length > 0, 'History contains completed course records', `${historyRes.data?.history?.length} items`);

  // ---------------------------------------------------------
  // 4. CURRICULUM SUBJECTS CATALOG
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}4. Curriculum Subjects Catalog Endpoints${colors.reset}`);

  const allSubjects = await request('/subjects', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(allSubjects.status === 200, 'GET /api/subjects returns subject list');
  assert(allSubjects.data?.count >= 22, 'Subject catalog contains at least 22 accredited courses', `${allSubjects.data?.count} courses`);

  // Semester Filter
  const sem2Subjects = await request('/subjects?semester=2', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(sem2Subjects.status === 200, 'GET /api/subjects?semester=2 filtered successfully');
  const allSem2 = sem2Subjects.data?.data?.every((s) => s.semester === 2);
  assert(allSem2, 'All returned courses belong to Semester 2');

  // Subject Type Filter
  const practicalSubjects = await request('/subjects?subjectType=Practical', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(practicalSubjects.status === 200, 'GET /api/subjects?subjectType=Practical filtered successfully');

  // RBAC: Student cannot create subject
  const studentCreateSub = await request('/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ subjectCode: 'HACK99', subjectName: 'Hacking', semester: 1, credits: 4 }),
  });
  assert(studentCreateSub.status === 403, 'RBAC: Student blocked from creating curriculum subjects (HTTP 403)');

  // Admin creates test subject
  const testSubCode = `TEST${Date.now().toString().slice(-4)}`;
  const adminCreateSub = await request('/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      subjectCode: testSubCode,
      subjectName: 'Advanced Quantum Computing Test',
      semester: 4,
      subjectType: 'Elective',
      credits: 4,
      description: 'Quantum gates, qubits, and Shor algorithm',
    }),
  });
  assert(adminCreateSub.status === 201, 'Admin successfully adds subject (HTTP 201)', testSubCode);
  testSubjectId = adminCreateSub.data?.data?._id;

  // Update Subject
  const updateSub = await request(`/subjects/${testSubjectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ subjectName: 'Advanced Quantum Computing - Revised' }),
  });
  assert(updateSub.status === 200, 'Admin successfully updates subject');

  // ---------------------------------------------------------
  // 5. STUDENT MANAGEMENT (ADMIN CRUD)
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}5. Student Management Endpoints (Admin CRUD)${colors.reset}`);

  // RBAC: Student cannot view all students
  const studentGetAll = await request('/students', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(studentGetAll.status === 403, 'RBAC: Student cannot list all student records (HTTP 403)');

  // Admin get all students
  const adminGetStudents = await request('/students', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminGetStudents.status === 200, 'Admin lists all students (HTTP 200)');
  assert(adminGetStudents.data?.count >= 3, 'Returns all enrolled students', `${adminGetStudents.data?.count} students`);

  // Admin create student
  const testRoll = `TEST-ROLL-${Date.now().toString().slice(-4)}`;
  const createStudentRes = await request('/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Aditi Deshmukh',
      email: `aditi.${Date.now()}@nepcredit.edu`,
      password: 'student123',
      rollNumber: testRoll,
      course: 'M.Sc. Data Science',
      department: 'Department of Computer Science',
      requiredCredits: 80,
    }),
  });
  assert(createStudentRes.status === 201, 'Admin creates new student record (HTTP 201)');
  testStudentId = createStudentRes.data?.data?._id;

  // Admin update student
  const updateStudentRes = await request(`/students/${testStudentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ phone: '+91 99999 88888', division: 'B' }),
  });
  assert(updateStudentRes.status === 200, 'Admin updates student profile');

  // ---------------------------------------------------------
  // 6. SUBJECT ENROLLMENT & CONTINUOUS GRADING
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}6. Student Subject Enrollment & Continuous Grading${colors.reset}`);

  // Assign test subject to test student
  const assignRes = await request('/student-subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      studentId: testStudentId,
      subjectId: testSubjectId,
      status: 'In Progress',
    }),
  });
  assert(assignRes.status === 201, 'Admin assigns subject to student (HTTP 201)');
  testStudentSubjectId = assignRes.data?.data?._id;

  // Duplicate assignment protection
  const dupAssign = await request('/student-subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      studentId: testStudentId,
      subjectId: testSubjectId,
    }),
  });
  assert(dupAssign.status === 400, 'Duplicate assignment prevented (HTTP 400)');

  // Grade Assessment & Status Update (Award 88 marks -> Grade A+ -> Completed)
  const gradeRes = await request(`/student-subjects/${testStudentSubjectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      marks: 88,
      status: 'Completed',
    }),
  });
  assert(gradeRes.status === 200, 'Admin enters continuous assessment marks');
  assert(gradeRes.data?.data?.grade === 'A+', 'Grade automatically computed to A+ for 88 marks', gradeRes.data?.data?.grade);
  assert(gradeRes.data?.data?.creditsEarned === 4, 'Credits earned automatically awarded upon Completed status', `${gradeRes.data?.data?.creditsEarned} Cr`);

  // Verify Credit Recalculation for this student
  const newStudentCredits = await request(`/credits/${testStudentId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(newStudentCredits.data?.data?.earnedCredits === 4, 'Live student credit calculation reflects new 4 earned credits');

  // ---------------------------------------------------------
  // 7. ADMIN DASHBOARD METRICS
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}7. Admin Dashboard Analytics${colors.reset}`);

  // Student forbidden
  const studentDash = await request('/dashboard/admin', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(studentDash.status === 403, 'RBAC: Student cannot access admin analytics (HTTP 403)');

  // Admin access
  const adminDash = await request('/dashboard/admin', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminDash.status === 200, 'Admin accesses /api/dashboard/admin (HTTP 200)');
  assert(typeof adminDash.data?.stats?.totalStudents === 'number', 'Total students count present', `${adminDash.data?.stats?.totalStudents}`);
  assert(typeof adminDash.data?.stats?.averageProgress === 'number', 'Average credit progress computed', `${adminDash.data?.stats?.averageProgress}%`);

  // ---------------------------------------------------------
  // 8. CLEANUP TEST DATA
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}8. Teardown Test Data & Cascade Purge${colors.reset}`);

  const deleteAssigned = await request(`/student-subjects/${testStudentSubjectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteAssigned.status === 200, 'Delete student-subject assignment');

  const deleteSub = await request(`/subjects/${testSubjectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteSub.status === 200, 'Delete test subject');

  const deleteSt = await request(`/students/${testStudentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteSt.status === 200, 'Delete test student (cascades User and StudentSubject)');

  // ---------------------------------------------------------
  // 9. DATABASE DIRECT MONGOOSE AUDIT
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}9. Direct MongoDB Database Verification${colors.reset}`);
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nep_credit_tracker');

  const userCount = await mongoose.connection.collection('users').countDocuments();
  const studentCount = await mongoose.connection.collection('students').countDocuments();
  const subjectCount = await mongoose.connection.collection('subjects').countDocuments();
  const studentSubjectCount = await mongoose.connection.collection('studentsubjects').countDocuments();

  assert(userCount >= 4, 'MongoDB users collection has records', `${userCount} users`);
  assert(studentCount >= 3, 'MongoDB students collection has records', `${studentCount} students`);
  assert(subjectCount >= 22, 'MongoDB subjects collection has records', `${subjectCount} subjects`);
  assert(studentSubjectCount >= 30, 'MongoDB studentSubjects collection has records', `${studentSubjectCount} enrollments`);

  await mongoose.connection.close();

  // ---------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------
  console.log(`\n${colors.bold}${colors.blue}========================================================================${colors.reset}`);
  console.log(`${colors.bold}   TEST SUMMARY: ${colors.green}${passed} PASSED${colors.reset} | ${colors.red}${failed} FAILED${colors.reset} (Total: ${passed + failed})`);
  console.log(`${colors.bold}${colors.blue}========================================================================${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.green}${colors.bold}✔ ALL DATABASE COLLECTIONS AND REST API ENDPOINTS VERIFIED 100%!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}✘ SOME TESTS FAILED.${colors.reset}\n`);
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
