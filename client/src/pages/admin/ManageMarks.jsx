import React, { useState, useEffect } from 'react';
import { studentService, studentSubjectService, creditService } from '../../services/api';

const ManageMarks = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [records, setRecords] = useState([]);
  const [creditSummary, setCreditSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editMarks, setEditMarks] = useState('');
  const [editGrade, setEditGrade] = useState('Pending');
  const [editStatus, setEditStatus] = useState('Pending');
  const [saving, setSaving] = useState(false);

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
        setErrorMsg('Failed to load students.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const loadData = async (stId) => {
    if (!stId) return;
    try {
      setRecordsLoading(true);
      const [recRes, credRes] = await Promise.all([
        studentSubjectService.getByStudentId(stId),
        creditService.getStudentCredits(stId),
      ]);

      if (recRes.data.success) {
        setRecords(recRes.data.data);
      }
      if (credRes.data.success) {
        setCreditSummary(credRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setEditMarks(rec.marks !== null && rec.marks !== undefined ? rec.marks : '');
    setEditGrade(rec.grade || 'Pending');
    setEditStatus(rec.status || 'Pending');
  };

  // Helper for auto-grade
  const handleMarksChange = (val) => {
    setEditMarks(val);
    if (val === '' || isNaN(val)) {
      setEditGrade('Pending');
      return;
    }
    const num = Number(val);
    if (num >= 90) {
      setEditGrade('O');
      setEditStatus('Completed');
    } else if (num >= 80) {
      setEditGrade('A+');
      setEditStatus('Completed');
    } else if (num >= 70) {
      setEditGrade('A');
      setEditStatus('Completed');
    } else if (num >= 60) {
      setEditGrade('B+');
      setEditStatus('Completed');
    } else if (num >= 55) {
      setEditGrade('B');
      setEditStatus('Completed');
    } else if (num >= 50) {
      setEditGrade('C');
      setEditStatus('Completed');
    } else if (num >= 40) {
      setEditGrade('P');
      setEditStatus('Completed');
    } else {
      setEditGrade('F');
      setEditStatus('In Progress');
    }
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const res = await studentSubjectService.update(editingRecord._id, {
        marks: editMarks !== '' ? Number(editMarks) : null,
        grade: editGrade,
        status: editStatus,
      });

      if (res.data.success) {
        setSuccessMsg(
          `Updated "${editingRecord.subjectId?.subjectName}": Marks: ${editMarks || 'N/A'}, Grade: ${editGrade}, Status: ${editStatus}. Credits automatically recalculated.`
        );
        setEditingRecord(null);
        loadData(selectedStudentId);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update marks.');
    } finally {
      setSaving(false);
    }
  };

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Manage Marks, Grades & Credit Status</h3>
        <p className="text-secondary small mb-0">
          Enter continuous assessment marks, assign NEP letter grades, and award course completion credits
        </p>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 small" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 small" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg('')}></button>
        </div>
      )}

      {/* Student Selector Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <label className="form-label fw-bold text-dark mb-2">
          <i className="bi bi-person-lines-fill me-2 text-primary"></i>Choose Student to Grade:
        </label>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-7">
            <select
              className="form-select form-select-lg"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name} ({st.rollNumber}) — {st.course} [{st.studentId}]
                </option>
              ))}
            </select>
          </div>

          {/* Live Calculated Stats Banner */}
          {creditSummary && (
            <div className="col-12 col-md-5">
              <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-secondary d-block">Live Credit Audit</small>
                  <strong className="fs-5 text-dark">
                    <span className="text-success">{creditSummary.earnedCredits}</span> / {creditSummary.requiredCredits} Cr
                  </strong>
                </div>
                <div className="text-end">
                  <span
                    className={`badge ${
                      creditSummary.isRequirementCompleted ? 'bg-success' : 'bg-primary'
                    } rounded-pill px-3 py-1 fs-6`}
                  >
                    {creditSummary.progressPercentage}% Progress
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grade Book Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            Enrolled Subjects for {selectedStudent?.name} ({records.length} Courses)
          </h6>
          <span className="small text-muted">Click the Edit icon to award marks and trigger automatic credit updates</span>
        </div>

        {recordsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-secondary small">Loading student grade book...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary text-uppercase">
                <tr>
                  <th className="ps-3 py-3">Subject Name</th>
                  <th>Code</th>
                  <th className="text-center">Semester</th>
                  <th>Category</th>
                  <th className="text-center">Subject Credits</th>
                  <th className="text-center">Marks (0-100)</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">Credit Status</th>
                  <th className="text-end pe-3 py-3">Update</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((item) => (
                    <tr key={item._id}>
                      <td className="ps-3 py-3">
                        <div className="fw-bold text-dark">{item.subjectId?.subjectName}</div>
                      </td>
                      <td className="font-monospace text-primary fw-semibold small">{item.subjectId?.subjectCode}</td>
                      <td className="text-center">
                        <span className="badge rounded-pill bg-light text-dark border">Sem {item.semester}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.subjectId?.subjectType}</span>
                      </td>
                      <td className="text-center fw-bold fs-6">{item.subjectId?.credits}</td>
                      <td className="text-center fw-bold">
                        {item.marks !== null ? `${item.marks}/100` : <span className="text-muted small">Not Graded</span>}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            item.grade === 'O' || item.grade === 'A+' || item.grade === 'A'
                              ? 'bg-success-subtle text-success border border-success'
                              : item.grade === 'F'
                              ? 'bg-danger text-white'
                              : 'bg-light text-dark border'
                          }`}
                        >
                          {item.grade || 'Pending'}
                        </span>
                      </td>
                      <td className="text-center">
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
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-outline-primary btn-sm rounded-pill px-3"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>Grade
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      No subjects enrolled for this student yet. Use the "Assign Subjects" tab first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Marks & Status Modal */}
      {editingRecord && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom bg-light">
                <div>
                  <h5 className="modal-title fw-bold text-dark">
                    Grade Assessment: {editingRecord.subjectId?.subjectName}
                  </h5>
                  <div className="text-muted small">
                    Code: {editingRecord.subjectId?.subjectCode} | Course Credits: {editingRecord.subjectId?.credits}
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setEditingRecord(null)}></button>
              </div>

              <form onSubmit={handleSaveMarks}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Exam Marks (0 - 100)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg text-center fw-bold"
                      placeholder="e.g. 85"
                      min="0"
                      max="100"
                      value={editMarks}
                      onChange={(e) => handleMarksChange(e.target.value)}
                    />
                    <small className="text-muted">Entering marks auto-determines NEP grade and status below.</small>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Letter Grade</label>
                      <select
                        className="form-select"
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                      >
                        <option value="O">O (Outstanding - 90+)</option>
                        <option value="A+">A+ (Excellent - 80-89)</option>
                        <option value="A">A (Very Good - 70-79)</option>
                        <option value="B+">B+ (Good - 60-69)</option>
                        <option value="B">B (Above Avg - 55-59)</option>
                        <option value="C">C (Average - 50-54)</option>
                        <option value="P">P (Pass - 40-49)</option>
                        <option value="F">F (Fail - Below 40)</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Subject Status</label>
                      <select
                        className="form-select"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="Completed">Completed (Earns Credits)</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {editStatus === 'Completed' && (
                    <div className="p-3 bg-success-subtle text-success border border-success-subtle rounded-3 small">
                      <i className="bi bi-check2-circle me-1"></i>
                      Saving as <strong>Completed</strong> will immediately award{' '}
                      <strong>{editingRecord.subjectId?.credits} credits</strong> to the student's degree account.
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light" onClick={() => setEditingRecord(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={saving}>
                    {saving ? 'Updating...' : 'Save & Recalculate Credits'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMarks;
