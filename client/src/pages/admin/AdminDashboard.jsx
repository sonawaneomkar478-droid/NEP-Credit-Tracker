import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import CreditCard from '../../components/CreditCard';
import ProgressBar from '../../components/ProgressBar';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAdminStats();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setError('Failed to fetch administrator statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary small">Gathering institutional credit analytics...</p>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  const { stats = {}, topStudents = [], semesterDistribution = [] } = data || {};

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Academic Administration Dashboard</h3>
          <p className="text-secondary small mb-0">
            Institutional overview of National Education Policy (NEP) student credit governance
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/students" className="btn btn-outline-primary btn-sm rounded-pill fw-semibold">
            <i className="bi bi-person-plus-fill me-1"></i>Add Student
          </Link>
          <Link to="/admin/subjects" className="btn btn-outline-primary btn-sm rounded-pill fw-semibold">
            <i className="bi bi-journal-plus me-1"></i>Add Subject
          </Link>
          <Link to="/admin/assign-subjects" className="btn btn-primary btn-sm rounded-pill fw-semibold shadow-sm">
            <i className="bi bi-patch-check-fill me-1"></i>Assign Subjects
          </Link>
          <Link to="/admin/manage-marks" className="btn btn-success btn-sm rounded-pill fw-semibold shadow-sm">
            <i className="bi bi-award-fill me-1"></i>Update Marks
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
          <CreditCard
            title="Total Students"
            value={stats.totalStudents || 0}
            unit="Enrolled"
            icon="bi-people-fill"
            color="primary"
            subtitle={
              <span>
                <i className="bi bi-mortarboard text-primary me-1"></i>Active Cohorts
              </span>
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <CreditCard
            title="Total Subjects in Catalog"
            value={stats.totalSubjects || 0}
            unit="Courses"
            icon="bi-journals"
            color="purple"
            subtitle={
              <span>
                <i className="bi bi-check2-all text-indigo me-1"></i>Semesters 1 to 4
              </span>
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <CreditCard
            title="Average Credit Progress"
            value={`${stats.averageProgress || 0}%`}
            unit=""
            icon="bi-graph-up-arrow"
            color="info"
            subtitle={
              <span className="text-info">
                <i className="bi bi-calculator me-1"></i>Across all students
              </span>
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <CreditCard
            title="Completed Subject Records"
            value={stats.completedSubjects || 0}
            unit="Passed"
            icon="bi-patch-check-fill"
            color="success"
            subtitle={
              <span className="text-success">
                <i className="bi bi-check-circle me-1"></i>Credits Awarded
              </span>
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <CreditCard
            title="In-Progress Subjects"
            value={stats.inProgressSubjects || 0}
            unit="Enrolled"
            icon="bi-hourglass-split"
            color="primary"
            subtitle={
              <span>
                <i className="bi bi-clock me-1 text-primary"></i>Ongoing semester
              </span>
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <CreditCard
            title="Degree Requirements Met"
            value={stats.completedRequirementsCount || 0}
            unit="Graduates"
            icon="bi-trophy-fill"
            color="warning"
            subtitle={
              <span className="text-warning-emphasis">
                <i className="bi bi-award me-1"></i>Earned &ge; 80 Credits
              </span>
            }
          />
        </div>
      </div>

      {/* Cohort Credit Progress Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0 text-dark">
              <i className="bi bi-speedometer me-2 text-primary"></i>Student Credit Progress Overview
            </h6>
            <small className="text-secondary">Monitored progress toward required graduation credits</small>
          </div>
          <Link to="/admin/student-progress" className="btn btn-sm btn-outline-primary rounded-pill">
            View All Progress &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th className="ps-3 py-3">Student Name</th>
                <th>Student ID</th>
                <th>Course</th>
                <th className="text-center">Earned / Required</th>
                <th style={{ width: '30%' }}>Progress</th>
                <th className="pe-3 text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((st) => (
                <tr key={st._id}>
                  <td className="ps-3 py-3">
                    <div className="fw-bold text-dark">{st.name}</div>
                  </td>
                  <td className="font-monospace text-muted small">{st.studentId}</td>
                  <td className="small text-secondary">{st.course}</td>
                  <td className="text-center fw-semibold">
                    <span className="text-success">{st.earnedCredits}</span> / {st.requiredCredits} Cr
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar ${
                            st.progressPercentage >= 100
                              ? 'bg-success'
                              : st.progressPercentage >= 50
                              ? 'bg-primary'
                              : 'bg-warning'
                          }`}
                          style={{ width: `${st.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="small fw-bold text-dark" style={{ minWidth: '40px' }}>
                        {st.progressPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="pe-3 text-end">
                    {st.isRequirementCompleted ? (
                      <span className="badge bg-success-subtle text-success border border-success">
                        Completed
                      </span>
                    ) : (
                      <span className="badge bg-primary-subtle text-primary border border-primary">
                        In Progress
                      </span>
                    )}
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

export default AdminDashboard;
