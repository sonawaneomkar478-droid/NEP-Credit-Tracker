import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { creditService } from '../../services/api';

const AcademicReport = () => {
  const { user, student } = useAuth();
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      if (!student?._id) return;
      try {
        setLoading(true);
        const res = await creditService.getStudentCredits(student._id);
        if (res.data.success) {
          setCreditData(res.data.data);
        }
      } catch (err) {
        setError('Failed to load academic report.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary small">Preparing official academic transcript...</p>
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
  } = creditData || {};

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Top action toolbar (hidden on print) */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <div>
          <h3 className="fw-bold text-dark mb-1">Official Academic Report</h3>
          <p className="text-secondary small mb-0">
            Certified National Education Policy (NEP 2020) Credit Transcript & Performance Record
          </p>
        </div>
        <button className="btn btn-primary fw-semibold px-4 rounded-pill shadow-sm" onClick={handlePrint}>
          <i className="bi bi-printer-fill me-2"></i>Print Transcript
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="card border-0 shadow rounded-4 p-4 p-md-5 bg-white print-page">
        {/* Institutional Header */}
        <div className="border-bottom pb-4 mb-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <span className="bg-primary text-white p-2 rounded-3">
              <i className="bi bi-mortarboard-fill fs-4"></i>
            </span>
            <h4 className="fw-bolder mb-0 text-dark tracking-tight">DEPARTMENT OF HIGHER EDUCATION</h4>
          </div>
          <h5 className="fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '1px' }}>
            National Education Policy (NEP 2020) Academic Credit Transcript
          </h5>
          <p className="text-muted small mb-0">Continuous Assessment & Cumulative Credit Auditing System</p>
        </div>

        {/* Student Information Box */}
        <div className="bg-light p-4 rounded-4 border mb-4">
          <div className="row g-3 small">
            <div className="col-12 col-md-6 col-lg-4">
              <span className="text-secondary d-block">Student Full Name:</span>
              <strong className="fs-6 text-dark">{user?.name}</strong>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <span className="text-secondary d-block">NEP Student ID:</span>
              <strong className="fs-6 text-dark font-monospace">{student?.studentId}</strong>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <span className="text-secondary d-block">Roll Number:</span>
              <strong className="fs-6 text-dark font-monospace">{student?.rollNumber}</strong>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <span className="text-secondary d-block">Program of Study:</span>
              <strong className="text-dark">{student?.course}</strong>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <span className="text-secondary d-block">Department:</span>
              <strong className="text-dark">{student?.department}</strong>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <span className="text-secondary d-block">Academic Batch / Division:</span>
              <strong className="text-dark">{student?.academicYear} (Div {student?.division || 'A'})</strong>
            </div>
          </div>
        </div>

        {/* Semester-wise Subject Tables */}
        {semesterBreakdown.map((sem) => (
          <div key={sem.semester} className="mb-4">
            <div className="d-flex justify-content-between align-items-center bg-light p-2 px-3 border rounded-top">
              <h6 className="fw-bold mb-0 text-dark">Semester {sem.semester}</h6>
              <span className="small text-secondary fw-semibold">
                Credits Earned: <strong className="text-success">{sem.earnedCredits}</strong> / {sem.totalCredits}
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0 small">
                <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                  <tr>
                    <th style={{ width: '15%' }}>Subject Code</th>
                    <th style={{ width: '40%' }}>Subject Name</th>
                    <th style={{ width: '15%' }}>Category</th>
                    <th className="text-center" style={{ width: '8%' }}>Credits</th>
                    <th className="text-center" style={{ width: '8%' }}>Marks</th>
                    <th className="text-center" style={{ width: '7%' }}>Grade</th>
                    <th className="text-center" style={{ width: '7%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sem.subjects.map((sub) => (
                    <tr key={sub._id}>
                      <td className="font-monospace fw-semibold">{sub.subjectCode}</td>
                      <td className="fw-semibold text-dark">{sub.subjectName}</td>
                      <td>{sub.subjectType}</td>
                      <td className="text-center fw-bold">{sub.credits}</td>
                      <td className="text-center">{sub.marks !== null ? sub.marks : '—'}</td>
                      <td className="text-center fw-bold">
                        <span className={sub.grade === 'F' ? 'text-danger' : 'text-dark'}>
                          {sub.grade || '—'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            sub.status === 'Completed'
                              ? 'bg-success text-white'
                              : sub.status === 'In Progress'
                              ? 'bg-primary text-white'
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
        ))}

        {/* Cumulative NEP Credit Summary Footer Box */}
        <div className="border border-2 border-dark rounded-4 p-4 mt-4 bg-light">
          <h6 className="fw-bold text-dark text-uppercase border-bottom pb-2 mb-3">
            Cumulative NEP Credit Summary & Degree Status
          </h6>

          <div className="row g-3 text-center">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-white border rounded-3">
                <div className="text-secondary small fw-semibold">Total Required Credits</div>
                <div className="fs-3 fw-bold text-dark mt-1">{requiredCredits}</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-white border rounded-3">
                <div className="text-secondary small fw-semibold">Total Earned Credits</div>
                <div className="fs-3 fw-bold text-success mt-1">{earnedCredits}</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-white border rounded-3">
                <div className="text-secondary small fw-semibold">Total Remaining Credits</div>
                <div className="fs-3 fw-bold text-warning-emphasis mt-1">{remainingCredits}</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-white border rounded-3">
                <div className="text-secondary small fw-semibold">Overall Degree Progress</div>
                <div className="fs-3 fw-bold text-primary mt-1">{progressPercentage}%</div>
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-3 bg-white border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <div>
              <span className="text-secondary small me-2">Graduation Eligibility:</span>
              {isRequirementCompleted ? (
                <span className="badge bg-success fs-6 px-3 py-1">
                  <i className="bi bi-patch-check-fill me-1"></i> Credit Requirement Completed
                </span>
              ) : (
                <span className="badge bg-warning text-dark fs-6 px-3 py-1">
                  <i className="bi bi-clock-history me-1"></i> Degree In Progress ({remainingCredits} credits remaining)
                </span>
              )}
            </div>

            <div className="text-secondary small">
              Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Official Signatures Row */}
        <div className="row mt-5 pt-4 text-center">
          <div className="col-4">
            <div className="border-top pt-2 text-secondary small fw-semibold">Student Signature</div>
          </div>
          <div className="col-4">
            <div className="border-top pt-2 text-secondary small fw-semibold">Head of Department</div>
          </div>
          <div className="col-4">
            <div className="border-top pt-2 text-secondary small fw-semibold">Controller of Examinations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicReport;
