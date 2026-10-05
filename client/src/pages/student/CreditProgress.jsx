import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { creditService } from '../../services/api';
import CreditDoughnutChart from '../../components/Charts/CreditDoughnutChart';
import SemesterBarChart from '../../components/Charts/SemesterBarChart';
import ProgressBar from '../../components/ProgressBar';

const CreditProgress = () => {
  const { student } = useAuth();
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCredits = async () => {
      if (!student?._id) return;
      try {
        setLoading(true);
        const res = await creditService.getStudentCredits(student._id);
        if (res.data.success) {
          setCreditData(res.data.data);
        }
      } catch (err) {
        setError('Failed to load credit progress analytics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [student]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary small">Computing NEP credit distributions...</p>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  const {
    requiredCredits = 80,
    earnedCredits = 0,
    remainingCredits = 80,
    progressPercentage = 0,
    isRequirementCompleted = false,
    semesterBreakdown = [],
    subjectTypeBreakdown = {},
  } = creditData || {};

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">NEP Credit Progress Analytics</h3>
        <p className="text-secondary small mb-0">
          In-depth audit of degree credits categorized by National Education Policy vertical requirements
        </p>
      </div>

      {/* Main Overall Progress Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <ProgressBar
              progress={progressPercentage}
              earned={earnedCredits}
              required={requiredCredits}
              height="1.5rem"
            />
            <div className="mt-3 text-secondary small">
              {isRequirementCompleted ? (
                <span className="text-success fw-bold">
                  <i className="bi bi-patch-check-fill me-1"></i>
                  All minimum graduation credit thresholds have been satisfied.
                </span>
              ) : (
                <span>
                  <i className="bi bi-info-circle me-1 text-primary"></i>
                  You need <strong>{remainingCredits} more credits</strong> to qualify for degree convocation.
                </span>
              )}
            </div>
          </div>
          <div className="col-lg-4 text-center border-start-lg">
            <CreditDoughnutChart earned={earnedCredits} remaining={remainingCredits} required={requiredCredits} />
          </div>
        </div>
      </div>

      {/* Subject Type Breakdown Grid */}
      <div className="mb-4">
        <h5 className="fw-bold text-dark mb-3">Credits by NEP Subject Category</h5>
        <div className="row g-3">
          {Object.entries(subjectTypeBreakdown).map(([category, stats]) => {
            const catPct = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0;
            return (
              <div key={category} className="col-12 col-sm-6 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark">{category}</span>
                    <span className={`badge ${catPct === 100 ? 'bg-success' : 'bg-primary-subtle text-primary'}`}>
                      {catPct}%
                    </span>
                  </div>
                  <div className="d-flex align-items-baseline gap-1 mb-2">
                    <span className="fs-4 fw-bold text-dark">{stats.earned}</span>
                    <span className="text-secondary small">/ {stats.total} Assigned Credits</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className={`progress-bar ${catPct === 100 ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${catPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Semester Timeline Chart */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <h5 className="fw-bold text-dark mb-3">Semester-wise Credit Acquisition</h5>
        <SemesterBarChart semesterData={semesterBreakdown} />
      </div>
    </div>
  );
};

export default CreditProgress;
