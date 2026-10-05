import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { creditService, studentSubjectService } from '../../services/api';
import CreditCard from '../../components/CreditCard';
import ProgressBar from '../../components/ProgressBar';
import CreditDoughnutChart from '../../components/Charts/CreditDoughnutChart';
import SemesterBarChart from '../../components/Charts/SemesterBarChart';
import SubjectStatusChart from '../../components/Charts/SubjectStatusChart';
import confetti from 'canvas-confetti';

const StudentDashboard = () => {
  const { user, student } = useAuth();
  const [creditData, setCreditData] = useState(null);
  const [recentSubjects, setRecentSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!student?._id) return;
      try {
        setLoading(true);
        const [creditRes, subjRes] = await Promise.all([
          creditService.getStudentCredits(student._id),
          studentSubjectService.getByStudentId(student._id),
        ]);

        if (creditRes.data.success) {
          setCreditData(creditRes.data.data);
          // If requirement is completed, trigger celebratory confetti
          if (creditRes.data.data.isRequirementCompleted) {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          }
        }
        if (subjRes.data.success) {
          setRecentSubjects(subjRes.data.data.slice(0, 5));
        }
      } catch (err) {
        setError('Failed to load credit dashboard data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [student]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-secondary small">Calculating your NEP credits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 m-3">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <div>{error}</div>
      </div>
    );
  }

  const {
    requiredCredits = 80,
    earnedCredits = 0,
    remainingCredits = 80,
    progressPercentage = 0,
    isRequirementCompleted = false,
    semesterBreakdown = [],
    subjectStats = {},
  } = creditData || {};

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Top Welcome Banner */}
      <div className="card border-0 shadow-sm rounded-4 bg-gradient-welcome text-white p-4 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <span className="badge bg-white bg-opacity-25 text-white mb-2 px-3 py-1">
              <i className="bi bi-mortarboard me-1"></i>NEP Credit Tracker
            </span>
            <h2 className="fw-bold mb-1">Welcome, {user?.name || student?.name}!</h2>
            <p className="text-white-50 mb-0">
              Student ID: <strong>{student?.studentId}</strong> | Roll No: <strong>{student?.rollNumber}</strong> |{' '}
              {student?.course} ({student?.academicYear})
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link to="/student/academic-report" className="btn btn-light fw-semibold rounded-pill px-3 shadow-sm">
              <i className="bi bi-printer-fill me-2 text-primary"></i>Official Report
            </Link>
          </div>
        </div>
      </div>

      {/* Completion Banner if Earned >= Required */}
      {isRequirementCompleted && (
        <div className="alert alert-success border-0 shadow-sm rounded-4 p-4 mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-trophy-fill fs-3"></i>
            </div>
            <div>
              <h5 className="alert-heading fw-bold mb-1">Credit Requirement Completed!</h5>
              <p className="mb-0 text-success-emphasis small">
                Congratulations! You have successfully earned {earnedCredits} credits, fulfilling all minimum graduation requirements under NEP 2020.
              </p>
            </div>
          </div>
          <span className="badge bg-success fs-6 px-3 py-2 rounded-pill d-none d-md-inline-block">
            Degree Ready
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <CreditCard
            title="Total Required Credits"
            value={requiredCredits}
            unit="Credits"
            icon="bi-award"
            color="primary"
            subtitle={
              <span>
                <i className="bi bi-info-circle text-primary me-1"></i>Degree Requirement
              </span>
            }
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <CreditCard
            title="Credits Earned"
            value={earnedCredits}
            unit="Credits"
            icon="bi-check2-circle"
            color="success"
            subtitle={
              <span className="text-success">
                <i className="bi bi-arrow-up-right me-1"></i>Completed Subjects
              </span>
            }
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <CreditCard
            title="Credits Remaining"
            value={remainingCredits}
            unit="Credits"
            icon="bi-hourglass-split"
            color="warning"
            subtitle={
              <span>
                <i className="bi bi-clock me-1 text-warning"></i>To Graduate
              </span>
            }
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <CreditCard
            title="Completion Percentage"
            value={`${progressPercentage}%`}
            unit=""
            icon="bi-graph-up-arrow"
            color="info"
            subtitle={
              <span className="text-info">
                <i className="bi bi-speedometer me-1"></i>Calculated dynamically
              </span>
            }
          />
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <ProgressBar progress={progressPercentage} earned={earnedCredits} required={requiredCredits} height="1.4rem" />
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Chart 1: Credit Progress (Earned vs Remaining) */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-bottom p-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-pie-chart-fill text-success me-2"></i>Earned vs Remaining Credits
              </h6>
            </div>
            <div className="card-body p-3 d-flex flex-column justify-content-center">
              <CreditDoughnutChart earned={earnedCredits} remaining={remainingCredits} required={requiredCredits} />
            </div>
          </div>
        </div>

        {/* Chart 2: Semester-wise Credits */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-bottom p-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-bar-chart-fill text-primary me-2"></i>Semester-wise Credits
              </h6>
            </div>
            <div className="card-body p-3 d-flex flex-column justify-content-center">
              <SemesterBarChart semesterData={semesterBreakdown} />
            </div>
          </div>
        </div>

        {/* Chart 3: Subject Status */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-bottom p-3">
              <h6 className="fw-bold mb-0 text-dark">
                <i className="bi bi-ui-checks text-warning me-2"></i>Subject Status Breakdown
              </h6>
            </div>
            <div className="card-body p-3 d-flex flex-column justify-content-center">
              <SubjectStatusChart
                completed={subjectStats.completedCount || 0}
                inProgress={subjectStats.inProgressCount || 0}
                pending={subjectStats.pendingCount || 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Semester Progress Cards */}
      <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            <i className="bi bi-calendar3 me-2 text-primary"></i>Semester Credit Progress
          </h6>
          <Link to="/student/semester-details" className="btn btn-sm btn-outline-primary rounded-pill">
            View All Semesters &rarr;
          </Link>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            {semesterBreakdown.map((sem) => {
              const semPct = sem.totalCredits > 0 ? Math.round((sem.earnedCredits / sem.totalCredits) * 100) : 0;
              return (
                <div key={sem.semester} className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 rounded-3 bg-light border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark">Semester {sem.semester}</span>
                      <span className={`badge ${semPct === 100 ? 'bg-success' : semPct > 0 ? 'bg-primary' : 'bg-secondary'}`}>
                        {semPct}%
                      </span>
                    </div>
                    <div className="text-secondary small mb-2">
                      Earned: <strong className="text-dark">{sem.earnedCredits}</strong> / {sem.totalCredits} Credits
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className={`progress-bar ${semPct === 100 ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${semPct}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mt-2" style={{ fontSize: '0.72rem' }}>
                      <span>{sem.completedCount} Completed</span>
                      <span>{sem.inProgressCount + sem.pendingCount} Remaining</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Subjects Preview */}
      <div className="card border-0 shadow-sm rounded-4 bg-white">
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            <i className="bi bi-journals me-2 text-primary"></i>Assigned Subjects Overview
          </h6>
          <Link to="/student/subjects" className="btn btn-sm btn-primary rounded-pill">
            View Full Subject List &rarr;
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th className="ps-3">Subject Name</th>
                <th>Code</th>
                <th>Sem</th>
                <th>Type</th>
                <th className="text-center">Credits</th>
                <th className="text-center">Grade</th>
                <th className="text-center pe-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSubjects.map((item) => (
                <tr key={item._id}>
                  <td className="ps-3 fw-semibold text-dark">{item.subjectId?.subjectName}</td>
                  <td className="font-monospace text-muted small">{item.subjectId?.subjectCode}</td>
                  <td>Sem {item.semester}</td>
                  <td>
                    <span className="badge bg-light text-dark border">{item.subjectId?.subjectType}</span>
                  </td>
                  <td className="text-center fw-bold">{item.subjectId?.credits}</td>
                  <td className="text-center">
                    <span className="badge bg-light text-dark border">{item.grade || '—'}</span>
                  </td>
                  <td className="text-center pe-3">
                    <span
                      className={`badge ${
                        item.status === 'Completed'
                          ? 'bg-success'
                          : item.status === 'In Progress'
                          ? 'bg-primary'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
