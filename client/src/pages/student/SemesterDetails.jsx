import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { creditService } from '../../services/api';

const SemesterDetails = () => {
  const { student } = useAuth();
  const [creditData, setCreditData] = useState(null);
  const [activeSem, setActiveSem] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSemesterData = async () => {
      if (!student?._id) return;
      try {
        setLoading(true);
        const res = await creditService.getStudentCredits(student._id);
        if (res.data.success) {
          setCreditData(res.data.data);
          if (res.data.data.semesterBreakdown.length > 0) {
            setActiveSem(res.data.data.semesterBreakdown[0].semester);
          }
        }
      } catch (err) {
        setError('Failed to fetch semester details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSemesterData();
  }, [student]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary small">Loading semester records...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  const { semesterBreakdown = [] } = creditData || {};
  const currentSemesterInfo = semesterBreakdown.find((s) => s.semester === activeSem);

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Semester Breakdown</h3>
        <p className="text-secondary small mb-0">
          In-depth semester-by-semester credit audit, course completions, and grade distributions
        </p>
      </div>

      {/* Semester Selection Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {semesterBreakdown.map((sem) => {
          const isSelected = sem.semester === activeSem;
          const isFullyCompleted = sem.totalCredits > 0 && sem.earnedCredits >= sem.totalCredits;
          return (
            <button
              key={sem.semester}
              className={`btn px-4 py-2 rounded-4 fw-semibold border d-flex align-items-center gap-2 ${
                isSelected
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-white bg-white text-dark hover-shadow'
              }`}
              onClick={() => setActiveSem(sem.semester)}
            >
              <span>Semester {sem.semester}</span>
              {isFullyCompleted ? (
                <span className="badge bg-success rounded-pill small">Done</span>
              ) : (
                <span className={`badge ${isSelected ? 'bg-light text-dark' : 'bg-light text-secondary'} rounded-pill small`}>
                  {sem.earnedCredits}/{sem.totalCredits} Cr
                </span>
              )}
            </button>
          );
        })}
      </div>

      {currentSemesterInfo ? (
        <div>
          {/* Semester Stat Banner */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span className="text-secondary small fw-semibold text-uppercase">Assigned Credits</span>
                <div className="fs-3 fw-bold text-dark mt-1">{currentSemesterInfo.totalCredits} Credits</div>
                <small className="text-muted">{currentSemesterInfo.subjects.length} Subjects Curated</small>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span className="text-secondary small fw-semibold text-uppercase">Earned Credits</span>
                <div className="fs-3 fw-bold text-success mt-1">{currentSemesterInfo.earnedCredits} Credits</div>
                <small className="text-success">{currentSemesterInfo.completedCount} Subjects Completed</small>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <span className="text-secondary small fw-semibold text-uppercase">Semester Status</span>
                <div className="fs-3 fw-bold text-primary mt-1">
                  {currentSemesterInfo.totalCredits > 0
                    ? `${Math.round((currentSemesterInfo.earnedCredits / currentSemesterInfo.totalCredits) * 100)}%`
                    : '0%'}
                </div>
                <small className="text-muted">
                  {currentSemesterInfo.inProgressCount} In Progress • {currentSemesterInfo.pendingCount} Pending
                </small>
              </div>
            </div>
          </div>

          {/* Subjects Table for active semester */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">
                Curriculum Subjects for Semester {currentSemesterInfo.semester}
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th className="ps-3 py-3">Subject Name</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th className="text-center">Credits</th>
                    <th className="text-center">Marks</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center pe-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemesterInfo.subjects.map((sub) => (
                    <tr key={sub._id}>
                      <td className="ps-3 py-3">
                        <div className="fw-bold text-dark">{sub.subjectName}</div>
                      </td>
                      <td className="font-monospace text-muted small">{sub.subjectCode}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{sub.subjectType}</span>
                      </td>
                      <td className="text-center fw-bold">{sub.credits}</td>
                      <td className="text-center">
                        {sub.marks !== null && sub.marks !== undefined ? `${sub.marks}/100` : '—'}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            sub.grade === 'O' || sub.grade === 'A+' || sub.grade === 'A'
                              ? 'bg-success-subtle text-success'
                              : 'bg-light text-dark'
                          } border`}
                        >
                          {sub.grade || '—'}
                        </span>
                      </td>
                      <td className="text-center pe-3">
                        <span
                          className={`badge ${
                            sub.status === 'Completed'
                              ? 'bg-success'
                              : sub.status === 'In Progress'
                              ? 'bg-primary'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <p className="text-secondary mb-0">No subject records available for the selected semester.</p>
        </div>
      )}
    </div>
  );
};

export default SemesterDetails;
