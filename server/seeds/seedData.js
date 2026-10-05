const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const StudentSubject = require('../models/StudentSubject');

const subjectsData = [
  // Semester 1 (24 credits)
  {
    subjectCode: 'CS101',
    subjectName: 'Advanced Data Structures & Algorithms',
    semester: 1,
    subjectType: 'Core',
    credits: 4,
    description: 'Graph algorithms, dynamic programming, amortization, NP-completeness',
  },
  {
    subjectCode: 'CS102',
    subjectName: 'Advanced Operating Systems',
    semester: 1,
    subjectType: 'Core',
    credits: 4,
    description: 'Distributed kernels, virtualization, synchronization primitives, memory architecture',
  },
  {
    subjectCode: 'CS103',
    subjectName: 'Mathematical Foundations of Computer Science',
    semester: 1,
    subjectType: 'Core',
    credits: 4,
    description: 'Discrete math, linear algebra, probability models, graph theory',
  },
  {
    subjectCode: 'CS104',
    subjectName: 'Modern Web Application Architecture',
    semester: 1,
    subjectType: 'Skill-based',
    credits: 4,
    description: 'Single-page applications, RESTful microservices, state management',
  },
  {
    subjectCode: 'CS105',
    subjectName: 'Advanced Data Structures Lab',
    semester: 1,
    subjectType: 'Practical',
    credits: 4,
    description: 'Practical implementation of balanced trees, graph traversal, and flows',
  },
  {
    subjectCode: 'CS106',
    subjectName: 'Web Development Lab',
    semester: 1,
    subjectType: 'Practical',
    credits: 4,
    description: 'Hands-on full-stack development lab sessions',
  },

  // Semester 2 (24 credits)
  {
    subjectCode: 'CS201',
    subjectName: 'Cloud Computing & Distributed Systems',
    semester: 2,
    subjectType: 'Core',
    credits: 4,
    description: 'Virtualization, microservices, containerization with Docker and Kubernetes',
  },
  {
    subjectCode: 'CS202',
    subjectName: 'Database Engineering & Distributed DBs',
    semester: 2,
    subjectType: 'Core',
    credits: 4,
    description: 'ACID, BASE, distributed transactions, NoSQL internals, query optimization',
  },
  {
    subjectCode: 'CS203',
    subjectName: 'Machine Learning Foundations',
    semester: 2,
    subjectType: 'Elective',
    credits: 4,
    description: 'Supervised, unsupervised, regression, classification, clustering, PCA',
  },
  {
    subjectCode: 'CS204',
    subjectName: 'Cyber Security & Ethical Hacking',
    semester: 2,
    subjectType: 'Skill-based',
    credits: 4,
    description: 'Cryptographic protocols, network defense, penetration testing',
  },
  {
    subjectCode: 'CS205',
    subjectName: 'Cloud & DevOps Lab',
    semester: 2,
    subjectType: 'Practical',
    credits: 4,
    description: 'CI/CD pipeline configuration, cloud infrastructure deployment',
  },
  {
    subjectCode: 'CS206',
    subjectName: 'Mini Project - I',
    semester: 2,
    subjectType: 'Project',
    credits: 4,
    description: 'Domain-specific software engineering project with complete lifecycle',
  },

  // Semester 3 (24 credits)
  {
    subjectCode: 'CS301',
    subjectName: 'Artificial Intelligence & Deep Learning',
    semester: 3,
    subjectType: 'Core',
    credits: 4,
    description: 'Neural networks, CNNs, RNNs, Transformers, attention mechanisms',
  },
  {
    subjectCode: 'CS302',
    subjectName: 'Big Data Analytics & Streaming',
    semester: 3,
    subjectType: 'Elective',
    credits: 4,
    description: 'Hadoop, Spark ecosystem, Kafka stream processing, massive data pipelines',
  },
  {
    subjectCode: 'CS303',
    subjectName: 'Natural Language Processing',
    semester: 3,
    subjectType: 'Elective',
    credits: 4,
    description: 'Text preprocessing, sequence labeling, transformer-based language models',
  },
  {
    subjectCode: 'CS304',
    subjectName: 'Industrial Internship & Field Experience',
    semester: 3,
    subjectType: 'Internship',
    credits: 4,
    description: '45-day immersive industry training with certified evaluation',
  },
  {
    subjectCode: 'CS305',
    subjectName: 'AI & Deep Learning Lab',
    semester: 3,
    subjectType: 'Practical',
    credits: 4,
    description: 'PyTorch and TensorFlow model development and evaluation lab',
  },
  {
    subjectCode: 'CS306',
    subjectName: 'Research Seminar & Technical Writing',
    semester: 3,
    subjectType: 'Skill-based',
    credits: 4,
    description: 'Survey paper writing, IEEE format presentation, literature review',
  },

  // Semester 4 (24 credits)
  {
    subjectCode: 'CS401',
    subjectName: 'Internet of Things & Edge Computing',
    semester: 4,
    subjectType: 'Elective',
    credits: 4,
    description: 'Sensors, actuators, MQTT, edge analytics, hardware prototyping',
  },
  {
    subjectCode: 'CS402',
    subjectName: 'Blockchain Architecture & DApps',
    semester: 4,
    subjectType: 'Elective',
    credits: 4,
    description: 'Consensus mechanisms, Ethereum smart contracts, Web3 architecture',
  },
  {
    subjectCode: 'CS403',
    subjectName: 'Major Capstone Dissertation Project',
    semester: 4,
    subjectType: 'Project',
    credits: 12,
    description: 'Semester-long industry or research project with viva defense',
  },
  {
    subjectCode: 'CS404',
    subjectName: 'Comprehensive Viva-Voce',
    semester: 4,
    subjectType: 'Core',
    credits: 4,
    description: 'Oral examination covering overall degree curriculum',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nep_credit_tracker');
    console.log('[Seed] Connected to database.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Subject.deleteMany({});
    await StudentSubject.deleteMany({});

    // 1. Create Admin
    console.log('[Seed] Creating Admin account...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@nepcredit.edu',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`[Seed] Admin created: ${adminUser.email}`);

    // 2. Create Subjects
    console.log('[Seed] Inserting curriculum subjects...');
    const createdSubjects = await Subject.insertMany(subjectsData);
    console.log(`[Seed] Inserted ${createdSubjects.length} subjects.`);

    // Map subjects by code
    const subMap = {};
    createdSubjects.forEach((sub) => {
      subMap[sub.subjectCode] = sub;
    });

    // 3. Create Student 1: Aarav Sharma (The 52/80 credits example from user prompt)
    console.log('[Seed] Creating Student 1 (Aarav Sharma - 52/80 credits, 65%)...');
    const aaravUser = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@nepcredit.edu',
      password: 'student123',
      role: 'student',
    });

    const aaravStudent = await Student.create({
      studentId: 'STU2024001',
      userId: aaravUser._id,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@nepcredit.edu',
      rollNumber: 'MCS-2024-001',
      course: 'M.Sc. Computer Science',
      department: 'Department of Computer Science',
      academicYear: '2024-2026',
      division: 'A',
      phone: '+91 98765 43210',
      requiredCredits: 80,
    });

    // Semester 1: 5 subjects completed (20 credits), 1 in progress (4 credits) -> Earned: 20 / 24
    const aaravSem1 = [
      { code: 'CS101', marks: 88, grade: 'A+', status: 'Completed', creditsEarned: 4 },
      { code: 'CS102', marks: 82, grade: 'A+', status: 'Completed', creditsEarned: 4 },
      { code: 'CS103', marks: 74, grade: 'A', status: 'Completed', creditsEarned: 4 },
      { code: 'CS104', marks: 91, grade: 'O', status: 'Completed', creditsEarned: 4 },
      { code: 'CS105', marks: 85, grade: 'A+', status: 'Completed', creditsEarned: 4 },
      { code: 'CS106', marks: null, grade: 'Pending', status: 'In Progress', creditsEarned: 0 },
    ];

    // Semester 2: 4 subjects completed (16 credits), 2 pending/in progress -> Earned: 16 / 24
    const aaravSem2 = [
      { code: 'CS201', marks: 84, grade: 'A+', status: 'Completed', creditsEarned: 4 },
      { code: 'CS202', marks: 78, grade: 'A', status: 'Completed', creditsEarned: 4 },
      { code: 'CS203', marks: 86, grade: 'A+', status: 'Completed', creditsEarned: 4 },
      { code: 'CS204', marks: 72, grade: 'A', status: 'Completed', creditsEarned: 4 },
      { code: 'CS205', marks: null, grade: 'Pending', status: 'In Progress', creditsEarned: 0 },
      { code: 'CS206', marks: null, grade: 'Pending', status: 'Pending', creditsEarned: 0 },
    ];

    // Semester 3: 4 subjects completed (16 credits), 2 in progress -> Earned: 16 / 24
    const aaravSem3 = [
      { code: 'CS301', marks: 92, grade: 'O', status: 'Completed', creditsEarned: 4 },
      { code: 'CS302', marks: 81, grade: 'A+', status: 'Completed', creditsEarned: 4 },
      { code: 'CS303', marks: 76, grade: 'A', status: 'Completed', creditsEarned: 4 },
      { code: 'CS304', marks: 95, grade: 'O', status: 'Completed', creditsEarned: 4 },
      { code: 'CS305', marks: null, grade: 'Pending', status: 'In Progress', creditsEarned: 0 },
      { code: 'CS306', marks: null, grade: 'Pending', status: 'Pending', creditsEarned: 0 },
    ];

    // Semester 4: 0 earned, all pending -> Earned: 0 / 24
    const aaravSem4 = [
      { code: 'CS401', marks: null, grade: 'Pending', status: 'Pending', creditsEarned: 0 },
      { code: 'CS402', marks: null, grade: 'Pending', status: 'Pending', creditsEarned: 0 },
      { code: 'CS403', marks: null, grade: 'Pending', status: 'Pending', creditsEarned: 0 },
      { code: 'CS404', marks: null, grade: 'Pending', status: 'Pending', creditsEarned: 0 },
    ];

    const aaravAll = [...aaravSem1, ...aaravSem2, ...aaravSem3, ...aaravSem4];
    for (const item of aaravAll) {
      const sub = subMap[item.code];
      if (sub) {
        await StudentSubject.create({
          studentId: aaravStudent._id,
          subjectId: sub._id,
          semester: sub.semester,
          status: item.status,
          marks: item.marks,
          grade: item.grade,
          creditsEarned: item.creditsEarned,
        });
      }
    }
    console.log('[Seed] Aarav Sharma seeded (Earned: 52, Remaining: 28, Progress: 65%).');

    // 4. Create Student 2: Priya Patel (100% completed, 80/80 credits)
    console.log('[Seed] Creating Student 2 (Priya Patel - 80/80 credits, Completed)...');
    const priyaUser = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@nepcredit.edu',
      password: 'student123',
      role: 'student',
    });

    const priyaStudent = await Student.create({
      studentId: 'STU2024002',
      userId: priyaUser._id,
      name: 'Priya Patel',
      email: 'priya.patel@nepcredit.edu',
      rollNumber: 'MCS-2024-002',
      course: 'M.Sc. Computer Science',
      department: 'Department of Computer Science',
      academicYear: '2024-2026',
      division: 'A',
      phone: '+91 98220 11223',
      requiredCredits: 80,
    });

    // 20 subjects completed: 6 in sem 1 (24), 6 in sem 2 (24), 6 in sem 3 (24), plus sem 4 capstone project (12) and viva (4) = 88 credits (> 80)!
    // Let's assign exactly 80 completed credits:
    // Sem 1: 6 subjects = 24
    // Sem 2: 6 subjects = 24
    // Sem 3: 6 subjects = 24
    // Sem 4: CS401 (4) + CS402 (4) = 8 -> Total = 80 credits!
    const priyaCodes = [
      'CS101', 'CS102', 'CS103', 'CS104', 'CS105', 'CS106',
      'CS201', 'CS202', 'CS203', 'CS204', 'CS205', 'CS206',
      'CS301', 'CS302', 'CS303', 'CS304', 'CS305', 'CS306',
      'CS401', 'CS402'
    ];

    for (const code of priyaCodes) {
      const sub = subMap[code];
      if (sub) {
        await StudentSubject.create({
          studentId: priyaStudent._id,
          subjectId: sub._id,
          semester: sub.semester,
          status: 'Completed',
          marks: Math.floor(Math.random() * 15) + 85, // 85 - 99
          grade: 'O',
          creditsEarned: sub.credits,
        });
      }
    }
    console.log('[Seed] Priya Patel seeded (Earned: 80, Remaining: 0, Progress: 100%).');

    // 5. Create Student 3: Rohan Verma (24/80 credits, 30%)
    console.log('[Seed] Creating Student 3 (Rohan Verma - 24/80 credits, In Progress)...');
    const rohanUser = await User.create({
      name: 'Rohan Verma',
      email: 'rohan.verma@nepcredit.edu',
      password: 'student123',
      role: 'student',
    });

    const rohanStudent = await Student.create({
      studentId: 'STU2024003',
      userId: rohanUser._id,
      name: 'Rohan Verma',
      email: 'rohan.verma@nepcredit.edu',
      rollNumber: 'MCS-2024-003',
      course: 'M.Sc. Computer Science',
      department: 'Department of Computer Science',
      academicYear: '2024-2026',
      division: 'B',
      phone: '+91 97112 33445',
      requiredCredits: 80,
    });

    // Semester 1 completed: 24 credits
    const sem1Codes = ['CS101', 'CS102', 'CS103', 'CS104', 'CS105', 'CS106'];
    for (const code of sem1Codes) {
      const sub = subMap[code];
      if (sub) {
        await StudentSubject.create({
          studentId: rohanStudent._id,
          subjectId: sub._id,
          semester: 1,
          status: 'Completed',
          marks: 75,
          grade: 'A',
          creditsEarned: sub.credits,
        });
      }
    }

    // Semester 2: in progress / pending
    const sem2Codes = ['CS201', 'CS202', 'CS203', 'CS204', 'CS205', 'CS206'];
    for (const code of sem2Codes) {
      const sub = subMap[code];
      if (sub) {
        await StudentSubject.create({
          studentId: rohanStudent._id,
          subjectId: sub._id,
          semester: 2,
          status: 'In Progress',
          marks: null,
          grade: 'Pending',
          creditsEarned: 0,
        });
      }
    }
    console.log('[Seed] Rohan Verma seeded (Earned: 24, Remaining: 56, Progress: 30%).');

    console.log('\n=============================================================');
    console.log('  SEED COMPLETED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('Sample Credentials:');
    console.log('  Admin:');
    console.log('    Email:    admin@nepcredit.edu');
    console.log('    Password: admin123');
    console.log('  Students:');
    console.log('    1. Aarav Sharma (52/80 credits, 65%):');
    console.log('       Email:    aarav.sharma@nepcredit.edu');
    console.log('       Password: student123');
    console.log('    2. Priya Patel (80/80 credits, 100% - Requirement Completed):');
    console.log('       Email:    priya.patel@nepcredit.edu');
    console.log('       Password: student123');
    console.log('    3. Rohan Verma (24/80 credits, 30%):');
    console.log('       Email:    rohan.verma@nepcredit.edu');
    console.log('       Password: student123');
    console.log('=============================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
