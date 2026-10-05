import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import AdminLogin from './pages/public/AdminLogin';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Profile from './pages/student/Profile';
import Subjects from './pages/student/Subjects';
import SemesterDetails from './pages/student/SemesterDetails';
import CreditProgress from './pages/student/CreditProgress';
import CreditHistory from './pages/student/CreditHistory';
import AcademicReport from './pages/student/AcademicReport';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSubjects from './pages/admin/ManageSubjects';
import AssignSubjects from './pages/admin/AssignSubjects';
import ManageMarks from './pages/admin/ManageMarks';
import StudentProgress from './pages/admin/StudentProgress';
import AdminReports from './pages/admin/AdminReports';

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isPublicPage = ['/', '/login', '/register', '/admin-login'].includes(location.pathname);

  if (isPublicPage || !isAuthenticated) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-grow-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="d-flex flex-grow-1 position-relative">
        <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
        <main className="main-content flex-grow-1 p-0">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/subjects"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/semester-details"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SemesterDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/credit-progress"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CreditProgress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/credit-history"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CreditHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/academic-report"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AcademicReport />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assign-subjects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AssignSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-marks"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageMarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/student-progress"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentProgress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
