# Student NEP Credit Tracker (MERN Stack)

> **M.Sc. Computer Science Final Year Project**  
> A full-stack academic credit governance and degree tracking web application built strictly in accordance with the **National Education Policy (NEP 2020)** curriculum and credit framework.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Schema (MongoDB)](#database-schema-mongodb)
6. [NEP Credit Calculation Mathematical Engine](#nep-credit-calculation-mathematical-engine)
7. [Installation & Setup Guide](#installation--setup-guide)
8. [Sample Test Credentials (Viva-Ready)](#sample-test-credentials-viva-ready)
9. [REST API Documentation](#rest-api-documentation)
10. [Folder Structure](#folder-structure)
11. [M.Sc. Project Viva Voce Guide & Q&A](#msc-project-viva-voce-guide--qa)
12. [Future Scope](#future-scope)

---

## 🎯 Project Overview

Under the **National Education Policy (NEP 2020)**, higher education institutions implement a modular, credit-based curriculum with defined credit requirements across Core, Elective, Practical, Project, Internship, and Skill-based verticals.

The **Student NEP Credit Tracker** solves the challenge of manual credit calculation and fragmented transcript verification. It provides:
- **For Students:** Live visibility into earned vs. required credits, semester progress meters, visual Doughnut/Bar analytics, and downloadable official transcripts.
- **For Academic Administrators:** Curriculum catalog control, batch semester enrollment, continuous assessment grading, letter grade determination (O to F), and graduation clearance auditing.

---

## 🌟 Key Features

### 👨‍🎓 Student Portal
- **Student Dashboard:** Personalized greeting (`Welcome, [Student Name]`), dynamic summary cards (Total Required Credits, Credits Earned, Credits Remaining, Completion Percentage), and animated milestone progress bar.
- **NEP Degree Ready Badge:** Automatically triggers a celebratory visual notification and completion status whenever earned credits reach or exceed the minimum threshold (e.g., 80 Credits).
- **Interactive Visualizations (Chart.js):**
  - **Earned vs. Remaining Credits:** Centered doughnut visualizer.
  - **Semester-wise Credit Acquisition:** Comparative bar chart contrasting earned vs. assigned credits.
  - **Subject Status Breakdown:** Doughnut distribution of Completed, In Progress, and Pending subjects.
- **Semester Details:** Tabbed breakdown of Semesters 1 through 4 with credit totals, subject grades, and marks.
- **My Subjects:** Searchable and filterable subject repository with status filters (`Completed`, `In Progress`, `Pending`) and subject category filters (`Core`, `Elective`, `Practical`, `Project`, `Internship`, `Skill-based`).
- **Credit Progress Analytics:** Vertical-specific credit breakdown showing progress across Core, Elective, and Practical buckets.
- **Credit History:** Chronological audit log of completed courses with completion dates, marks, and grades.
- **Official Academic Report:** Certified print-friendly NEP 2020 Academic Credit Transcript with student details, semester tables, cumulative summary box, and institutional signature lines (`window.print()`).

### 🛡️ Admin Console
- **Admin Dashboard:** Real-time statistics including Total Students, Total Subjects, Completed Subjects, Pending Subjects, Average Progress, and Degree Clearance Counters.
- **Manage Students:** Complete CRUD (Add, Edit, Delete with safety confirmation modal) and live search across student ID, name, email, and roll number.
- **Manage Subjects:** Master curriculum catalog (Code, Name, Semester 1-8, Credits 1-30, Category, Syllabus Description).
- **Assign Subjects:**
  - Individual course assignment with custom status.
  - One-click **Batch Semester Assignment** that automatically enrolls a student into all accredited courses for that semester.
- **Manage Marks & Grades:** Grade book supporting continuous evaluation (marks 0-100), automatic NEP 10-point letter grade assignment (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`), and instant credit re-computation.
- **Student Progress Monitoring:** Color-coded cohort progress bars with filters for Degree Completed (&ge;100%), On Track (50-99%), and Early Stage (&lt;50%).
- **Institutional Reports:** Batch academic transcript generator and audit sheet printer.

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast Single Page Application (SPA) architecture |
| **Styling** | Bootstrap 5 + Bootstrap Icons | Academic UI theme, responsive grid, modern cards & modals |
| **Charts** | Chart.js + React-Chartjs-2 | Responsive Doughnut and Bar charts |
| **Backend** | Node.js + Express.js | Modular RESTful API server |
| **Database** | MongoDB + Mongoose ODM | Document-oriented database with referential integrity & indexing |
| **Authentication** | JWT (JSON Web Tokens) | Stateless role-based access token verification |
| **Security** | bcryptjs | Salted password hashing (never plaintext) |
| **Validation** | Express-Validator + Schema Validation | Frontend and backend data integrity enforcement |

---

## 📐 System Architecture

```
                                  BROWSER CLIENT (React.js + Vite)
                                  ├── Responsive UI (Bootstrap 5)
                                  ├── Chart.js Visualizations
                                  ├── Auth Context (JWT Storage)
                                  └── REST Client (Axios Interceptors)
                                                │
                                    HTTP / REST API (Port 5000)
                                    [Bearer: JWT Token]
                                                ▼
                                  EXPRESS.JS BACKEND SERVER
                                  ├── Auth Middleware (JWT & Roles)
                                  ├── Controllers (Student, Subject, Grade)
                                  ├── NEP Calculation Service
                                  └── Mongoose Models
                                                │
                                    MongoDB Driver (Port 27017)
                                                ▼
                                       MONGODB DATABASE
                                  ├── users (Credentials & Roles)
                                  ├── students (Academic Profiles)
                                  ├── subjects (Curriculum Catalog)
                                  └── studentSubjects (Grades & Credits)
```

---

## 🧮 NEP Credit Calculation Mathematical Engine

The core backend service (`server/services/creditCalculationService.js`) enforces the following NEP rules:

1. **Earned Credits:**
   $$\text{Earned Credits} = \sum_{\substack{\text{Subject } i \\ \text{Status } = \text{'Completed'}}} \text{Credits}_i$$

2. **Remaining Credits:**
   $$\text{Remaining Credits} = \max(0, \text{Required Credits} - \text{Earned Credits})$$
   *(Negative remaining credits are strictly prevented).*

3. **Progress Percentage:**
   $$\text{Progress \%} = \min\left(100, \frac{\text{Earned Credits}}{\text{Required Credits}} \times 100\right)$$

4. **Completion Trigger:**
   $$\text{Is Completed} = \begin{cases} \text{true}, & \text{if Earned Credits} \ge \text{Required Credits} \\ \text{false}, & \text{otherwise} \end{cases}$$

5. **NEP 10-Point Grading Scale:**
   - Marks $\ge 90$: **O** (Outstanding - 10 Grade Points)
   - Marks $80 - 89$: **A+** (Excellent - 9 Grade Points)
   - Marks $70 - 79$: **A** (Very Good - 8 Grade Points)
   - Marks $60 - 69$: **B+** (Good - 7 Grade Points)
   - Marks $55 - 59$: **B** (Above Average - 6 Grade Points)
   - Marks $50 - 54$: **C** (Average - 5 Grade Points)
   - Marks $40 - 49$: **P** (Pass - 4 Grade Points)
   - Marks $< 40$: **F** (Fail - 0 Grade Points)

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local MongoDB Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)
- **npm** (v9 or higher)

### 1. Clone or Open Project
```bash
cd "e:\NEP CREDIT"
```

### 2. Configure Backend Environment
Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nep_credit_tracker
JWT_SECRET=nep_credit_tracker_super_secret_jwt_key_2026
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# In Root folder:
npm install

# In Server folder:
cd server && npm install

# In Client folder:
cd ../client && npm install
```

### 4. Seed the Database
Populates the admin account, 3 realistic students, 22 subjects, and complete grade records:
```bash
# From root:
npm run seed
# Or from server folder:
cd server && npm run seed
```

### 5. Run the Application
You can run both Frontend and Backend concurrently with a single command from the project root:
```bash
npm run dev
```

Alternatively, run in separate terminals:
- **Terminal 1 (Backend Server):**
  ```bash
  cd server && npm start
  # Runs on http://localhost:5000
  ```
- **Terminal 2 (Frontend Client):**
  ```bash
  cd client && npm run dev
  # Runs on http://localhost:5173 (or http://127.0.0.1:5173)
  ```

---

## 🔑 Sample Test Credentials (Viva-Ready)

| Role | Account Name | Email | Password | Academic State |
|---|---|---|---|---|
| **Admin** | System Administrator | `admin@nepcredit.edu` | `admin123` | Full access to students, curriculum & marks |
| **Student 1** | Aarav Sharma | `aarav.sharma@nepcredit.edu` | `student123` | **52 / 80 Credits (65%)** - Sem 1 (20 Cr), Sem 2 (16 Cr), Sem 3 (16 Cr) |
| **Student 2** | Priya Patel | `priya.patel@nepcredit.edu` | `student123` | **80 / 80 Credits (100%)** - Requirement Completed! |
| **Student 3** | Rohan Verma | `rohan.verma@nepcredit.edu` | `student123` | **24 / 80 Credits (30%)** - Sem 1 Done, Sem 2 In Progress |

> **Tip:** The public landing page (`/`) and login pages feature **one-click demo login buttons** for instant viva evaluation without manually typing credentials!

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new student (Public)
- `POST /api/auth/login` — Sign in as Student or Admin (Public)
- `GET /api/auth/me` — Retrieve active authenticated user profile (Private)

### Students (`/api/students`)
- `GET /api/students` — Retrieve all students with credit progress summary (Admin)
- `GET /api/students/:id` — Retrieve student profile and credit details (Admin / Student Self)
- `POST /api/students` — Enroll a new student account (Admin)
- `PUT /api/students/:id` — Update student information (Admin / Student Self)
- `DELETE /api/students/:id` — Delete student and cascade purge linked academic records (Admin)

### Curriculum Subjects (`/api/subjects`)
- `GET /api/subjects` — Retrieve all subjects with semester/category filters (Authenticated)
- `GET /api/subjects/:id` — Retrieve single subject by ID (Authenticated)
- `POST /api/subjects` — Add course to curriculum catalog (Admin)
- `PUT /api/subjects/:id` — Update subject details and credits (Admin)
- `DELETE /api/subjects/:id` — Remove subject from catalog (Admin)

### Student Subject Assignments (`/api/student-subjects`)
- `GET /api/student-subjects/:studentId` — Retrieve all courses assigned to a student (Authenticated)
- `POST /api/student-subjects` — Assign individual subject to student (Admin)
- `POST /api/student-subjects/batch-assign` — Batch enroll entire semester courses (Admin)
- `PUT /api/student-subjects/:id` — Update marks, grade, and status (Admin)
- `DELETE /api/student-subjects/:id` — Unassign course from student (Admin)

### Credit Engine (`/api/credits`)
- `GET /api/credits/:studentId` — Retrieve calculated credit statistics, semester breakdown, and progress (Authenticated)
- `GET /api/credits/:studentId/history` — Retrieve chronological audit log of completed credits (Authenticated)

### Analytics Dashboard (`/api/dashboard`)
- `GET /api/dashboard/admin` — Aggregate institutional statistics and progress metrics (Admin)

---

## 📁 Folder Structure

```text
e:/NEP CREDIT/
├── package.json                   # Root orchestrator script
├── README.md                      # Comprehensive documentation & Viva guide
│
├── server/                        # Express.js Backend Server
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── models/
│   │   ├── User.js                # User auth credentials & role
│   │   ├── Student.js             # Student demographic & degree data
│   │   ├── Subject.js             # Curriculum course catalog
│   │   └── StudentSubject.js      # Student course enrollments & grades
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   ├── studentSubjectController.js
│   │   ├── creditController.js
│   │   └── dashboardController.js
│   ├── services/
│   │   └── creditCalculationService.js  # NEP mathematical calculation engine
│   ├── utils/
│   │   └── gradeCalculator.js     # NEP 10-point letter grade converter
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification & role authorization
│   │   └── errorMiddleware.js     # Global exception handling
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── studentSubjectRoutes.js
│   │   ├── creditRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seeds/
│   │   └── seedData.js            # Database seeding script
│   ├── testApi.js                 # Automated API test suite
│   ├── server.js                  # Main server entrypoint
│   ├── .env                       # Environment configuration
│   └── .env.example
│
└── client/                        # React.js Frontend (Vite)
    ├── index.html                 # HTML entrypoint
    ├── vite.config.js             # Vite configuration with 0.0.0.0 host binding
    ├── package.json               # Client dependencies
    └── src/
        ├── services/
        │   └── api.js             # Axios client with JWT interceptors
        ├── context/
        │   └── AuthContext.jsx    # React Context for session management
        ├── components/
        │   ├── Navbar.jsx         # Navigation bar with user dropdown
        │   ├── Sidebar.jsx        # Role-based sidebar navigation
        │   ├── CreditCard.jsx     # Statistic display cards
        │   ├── ProgressBar.jsx    # Animated multi-stage progress meter
        │   ├── SubjectTable.jsx   # Filterable subject data table
        │   ├── ProtectedRoute.jsx # Client route guards
        │   └── Charts/
        │       ├── chartSetup.js
        │       ├── CreditDoughnutChart.jsx
        │       ├── SemesterBarChart.jsx
        │       └── SubjectStatusChart.jsx
        ├── pages/
        │   ├── public/
        │   │   ├── Landing.jsx    # NEP introduction & quick demo logins
        │   │   ├── Login.jsx      # Student sign-in
        │   │   ├── Register.jsx   # Student self-enrollment
        │   │   └── AdminLogin.jsx # Admin access portal
        │   ├── student/
        │   │   ├── StudentDashboard.jsx
        │   │   ├── Profile.jsx
        │   │   ├── Subjects.jsx
        │   │   ├── SemesterDetails.jsx
        │   │   ├── CreditProgress.jsx
        │   │   ├── CreditHistory.jsx
        │   │   └── AcademicReport.jsx # Print-ready official transcript
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── ManageStudents.jsx
        │       ├── ManageSubjects.jsx
        │       ├── AssignSubjects.jsx
        │       ├── ManageMarks.jsx
        │       ├── StudentProgress.jsx
        │       └── AdminReports.jsx
        ├── App.jsx                # Router & layout orchestration
        ├── main.jsx               # React DOM root
        └── index.css              # Custom styling & print CSS
```

---

## 🎓 M.Sc. Project Viva Voce Guide & Q&A

### Q1: What is the primary academic problem this project addresses?
**Answer:** Prior to NEP 2020, degree structures were rigid with fixed percentages. Under NEP 2020, education is credit-based, allowing multiple entry/exit points, interdisciplinary electives, and skill credits. Manually auditing whether a student has earned the mandatory minimum credits (e.g., 80 for M.Sc.) across semesters and categories is error-prone. This application automates real-time credit auditing, displays graphical progress meters, and produces verifiable transcripts.

### Q2: Why did you choose the MERN Stack?
**Answer:**
- **MongoDB:** Flexible JSON-like document model that accommodates semester-wise student-subject enrollments with compound indexes for high-speed queries.
- **Express.js & Node.js:** Asynchronous, non-blocking I/O event loop that delivers rapid RESTful JSON API responses with lightweight middleware chaining.
- **React.js:** Component-driven reactive UI architecture with Virtual DOM updates, enabling instant re-rendering of credit progress bars and Chart.js graphs when marks or statuses change.

### Q3: How is data security and authentication implemented?
**Answer:**
- Passwords are never stored in plaintext; they are hashed with `bcryptjs` using a salt work factor of 10.
- Sessions are managed via stateless **JSON Web Tokens (JWT)** signed with a secure server secret and checked in the `verifyJWT` Express middleware.
- Role-Based Access Control (`requireRole('admin')`) guards administrative endpoints against unauthorized student modifications.

### Q4: How is credit recalculation kept atomic and consistent?
**Answer:** The application computes credits dynamically via `creditCalculationService.js` on every query, rather than storing a stale static credit number. Whenever an administrator changes a subject's status to `Completed` or updates its marks, the sum of completed credits is recalculated instantaneously across all affected endpoints.

---

## 🔮 Future Scope
1. **Academic Bank of Credits (ABC ID) Integration:** Direct API synchronization with the Government of India's Digilocker ABC portal.
2. **Multiple Entry and Exit Support:** Automated certificate generation for 1-year PG Diploma (40 credits) vs. 2-year Master's Degree (80 credits).
3. **Faculty & Evaluator Portal:** Multi-tier authorization allowing subject teachers to submit internal marks for departmental approval.
4. **Push & Email Notifications:** Automated SMS/Email alerts when new semester marks are published.
