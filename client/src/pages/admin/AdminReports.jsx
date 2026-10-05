import React, { useState, useEffect } from 'react';
import { studentService, creditService } from '../../services/api';

const AdminReports = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingReport, setFetchingReport] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentService.getAll();
        if (res.data.success) {
          setStudents(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedStudentId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const loadReport = async (stId) => {
    if (!stId) return;
    try {
      setFetchingReport(true);
      const res = await creditService.getStudentCredits(stId);
      if (res.data.success) {
        setCreditData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingReport(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadReport(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handlePrint = () => {
    window.print();
  };

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Action Header (Hidden during print) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 d-print-none">
        <div>
          <h3 className="fw-bold text-dark mb-1">Institutional Credit Reports & Transcripts</h3>
          <p className="text-secondary small mb-0">
            Generate and print verified National Education Policy (NEP 2020) academic grade sheets
          </p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary fw-semibold px-4 rounded-pill shadow-sm" onClick={handlePrint}>
            <i className="bi bi-printer-fill me-2"></i>Print Official Transcript
          </button>
        </div>
      </div>

      {/* Student Selector Card (Hidden during print) */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4 d-print-none">
        <label className="form-label fw-bold text-dark mb-2">
          <i className="bi bi-person-badge-fill me-2 text-primary"></i>Select Student for Report Generation:
        </label>
        <select
          className="form-select form-select-lg"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          {students.map((st) => (
            <option key={st._id} value={st._id}>
              {st.name} ({st.rollNumber}) — {st.course} [{st.studentId}] — {st.progressPercentage || 0}%
            </option>
          ))}
        </select>
      </div>

      {/* Printable Sheet */}
      {creditData && (
        <div className="card border-0 shadow rounded-4 p-4 p-md-5 bg-white print-page">
          {/* Institutional Header */}
          <div className="border-bottom pb-4 mb-4 text-center">
            <div className="d-inline-flex align-items-center gap-2 mb-2">
              <span className="bg-primary text-white p-2 rounded-3">
                <i className="bi bi-mortarboard-fill fs-4"></i>
              </span>
              <h4 className="fw-bolder mb-0 text-dark tracking-tight">COLLEGE OF COMPUTER SCIENCE & IT</h4>
            </div>
            <h5 className="fw-bold text-secondary text-uppercase mb-1" style={{ letterSpacing: '1px' }}>
              OFFICIAL NEP 2020 ACADEMIC CREDIT TRANSCRIPT
            </h5>
            <p className="text-muted small mb-0">Issued by the Office of the Controller of Examinations</p>
          </div>

          {/* Student Particulars */}
          <div className="bg-light p-4 rounded-4 border mb-4">
            <div className="row g-3 small">
              <div className="col-12 col-md-6 col-lg-4">
                <span className="text-secondary d-block">Candidate Name:</span>
                <strong className="fs-6 text-dark">{creditData.student?.name}</strong>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <span className="text-secondary d-block">Permanent Student ID:</span>
                <strong className="fs-6 text-dark font-monospace">{creditData.student?.studentId}</strong>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <span className="text-secondary d-block">Exam Roll Number:</span>
                <strong className="fs-6 text-dark font-monospace">{creditData.student?.rollNumber}</strong>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <span className="text-secondary d-block">Program Enrolled:</span>
                <strong className="text-dark">{creditData.student?.course}</strong>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <span className="text-secondary d-block">Department:</span>
                <strong className="text-dark">{creditData.student?.department}</strong>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <span className="text-secondary d-block">Academic Batch & Division:</span>
                <strong className="text-dark">{creditData.student?.academicYear} (Section {creditData.student?.division || 'A'})</strong>
              </div>
            </div>
          </div>

          {/* Semester-wise Tables */}
          {creditData.semesterBreakdown.map((sem) => (
            <div key={sem.semester} className="mb-4">
              <div className="d-flex justify-content-between align-items-center bg-light p-2 px-3 border rounded-top">
                <h6 className="fw-bold mb-0 text-dark">Semester {sem.semester}</h6>
                <span className="small text-secondary fw-semibold">
                  Earned Credits: <strong className="text-success">{sem.earnedCredits}</strong> / {sem.totalCredits}
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0 small">
                  <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                    <tr>
                      <th style={{ width: '15%' }}>Code</th>
                      <th style={{ width: '40%' }}>Subject Title</th>
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
                        <td className="text-center fw-bold">{sub.grade || '—'}</td>
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

          {/* Cumulative Credit Audit Summary */}
          <div className="border border-2 border-dark rounded-4 p-4 mt-4 bg-light">
            <h6 className="fw-bold text-dark text-uppercase border-bottom pb-2 mb-3">
              Official Degree Credit Audit
            </h6>
            <div className="row g-3 text-center">
              <div className="col-3">
                <div className="p-3 bg-white border rounded-3">
                  <div className="text-secondary small fw-semibold">Required Credits</div>
                  <div className="fs-3 fw-bold text-dark mt-1">{creditData.requiredCredits}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="p-3 bg-white border rounded-3">
                  <div className="text-secondary small fw-semibold">Earned Credits</div>
                  <div className="fs-3 fw-bold text-success mt-1">{creditData.earnedCredits}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="p-3 bg-white border rounded-3">
                  <div className="text-secondary small fw-semibold">Remaining Credits</div>
                  <div className="fs-3 fw-bold text-warning-emphasis mt-1">{creditData.remainingCredits}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="p-3 bg-white border rounded-3">
                  <div className="text-secondary small fw-semibold">Audit Progress</div>
                  <div className="fs-3 fw-bold text-primary mt-1">{creditData.progressPercentage}%</div>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-3 bg-white border d-flex justify-content-between align-items-center">
              <div>
                <span className="text-secondary small me-2">Graduation Clearance:</span>
                {creditData.isRequirementCompleted ? (
                  <span className="badge bg-success fs-6 px-3 py-1">
                    <i className="bi bi-patch-check-fill me-1"></i> Credit Requirement Completed
                  </span>
                ) : (
                  <span className="badge bg-warning text-dark fs-6 px-3 py-1">
                    <i className="bi bi-clock-history me-1"></i> Degree Incomplete ({creditData.remainingCredits} Credits Remaining)
                  </span>
                )}
              </div>
              <div className="text-secondary small font-monospace">
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Verification Stamps */}
          <div className="row mt-5 pt-4 text-center">
            <div className="col-4">
              <div className="border-top pt-2 text-secondary small fw-semibold">Prepared By</div>
            </div>
            <div className="col-4">
              <div className="border-top pt-2 text-secondary small fw-semibold">Academic Dean</div>
            </div>
            <div className="col-4">
              <div className="border-top pt-2 text-secondary small fw-semibold">Controller of Examinations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
