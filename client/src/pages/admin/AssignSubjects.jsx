import React, { useState, useEffect } from 'react';
import { studentService, subjectService, studentSubjectService } from '../../services/api';

const AssignSubjects = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assignedRecords, setAssignedRecords] = useState([]);

  // Single assign form
  const [singleSubjectId, setSingleSubjectId] = useState('');
  const [singleStatus, setSingleStatus] = useState('In Progress');

  // Batch assign form
  const [batchSemester, setBatchSemester] = useState(1);

  const [loading, setLoading] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [stRes, subRes] = await Promise.all([studentService.getAll(), subjectService.getAll()]);
        if (stRes.data.success) {
          setStudents(stRes.data.data);
          if (stRes.data.data.length > 0) {
            setSelectedStudentId(stRes.data.data[0]._id);
          }
        }
        if (subRes.data.success) {
          setSubjects(subRes.data.data);
          if (subRes.data.data.length > 0) {
            setSingleSubjectId(subRes.data.data[0]._id);
          }
        }
      } catch (err) {
        setErrorMsg('Failed to initialize students and curriculum data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch assigned records whenever selected student changes
  const loadStudentRecords = async (stId) => {
    if (!stId) return;
    try {
      setFetchingRecords(true);
      const res = await studentSubjectService.getByStudentId(stId);
      if (res.data.success) {
        setAssignedRecords(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingRecords(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentRecords(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Handle Single Subject Assignment
  const handleAssignSingle = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId || !singleSubjectId) {
      setErrorMsg('Please select both a student and a subject.');
      return;
    }

    try {
      const selectedSub = subjects.find((s) => s._id === singleSubjectId);
      const res = await studentSubjectService.assign({
        studentId: selectedStudentId,
        subjectId: singleSubjectId,
        semester: selectedSub?.semester || 1,
        status: singleStatus,
      });

      if (res.data.success) {
        setSuccessMsg(`Assigned "${selectedSub?.subjectName}" successfully.`);
        loadStudentRecords(selectedStudentId);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to assign subject.');
    }
  };

  // Handle Batch Assignment by Semester
  const handleBatchAssign = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId || !batchSemester) {
      setErrorMsg('Please select a student and semester.');
      return;
    }

    try {
      const res = await studentSubjectService.batchAssign({
        studentId: selectedStudentId,
        semester: Number(batchSemester),
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message);
        loadStudentRecords(selectedStudentId);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to batch assign subjects.');
    }
  };

  // Remove Subject Assignment
  const handleRemoveAssignment = async (recordId, subName) => {
    if (!window.confirm(`Are you sure you want to remove "${subName}" from this student's curriculum?`)) {
      return;
    }

    try {
      const res = await studentSubjectService.delete(recordId);
      if (res.data.success) {
        setSuccessMsg(`Subject removed successfully.`);
        loadStudentRecords(selectedStudentId);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove assignment.');
    }
  };

  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Assign Curriculum Subjects</h3>
        <p className="text-secondary small mb-0">
          Enroll students into NEP curriculum courses either individually or by complete semester batches
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
          <i className="bi bi-person-check-fill me-2 text-primary"></i>Select Student to Manage Enrollments:
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
          {selectedStudent && (
            <div className="col-12 col-md-5">
              <div className="p-2 px-3 bg-light rounded-3 border small">
                <span className="text-secondary">Batch: </span>
                <strong>{selectedStudent.academicYear}</strong> |{' '}
                <span className="text-secondary">Required: </span>
                <strong className="text-primary">{selectedStudent.requiredCredits} Credits</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Forms (Two Columns) */}
      <div className="row g-4 mb-4">
        {/* Single Subject Assign */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-plus-circle-fill text-primary me-2"></i>Assign Single Subject
            </h5>
            <form onSubmit={handleAssignSingle}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Choose Subject from Catalog</label>
                <select
                  className="form-select"
                  value={singleSubjectId}
                  onChange={(e) => setSingleSubjectId(e.target.value)}
                >
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      [{sub.subjectCode}] {sub.subjectName} (Sem {sub.semester}, {sub.credits} Cr - {sub.subjectType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Initial Enrollment Status</label>
                <select
                  className="form-select"
                  value={singleStatus}
                  onChange={(e) => setSingleStatus(e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-semibold rounded-3 py-2">
                <i className="bi bi-box-arrow-in-down me-1"></i>Enroll Student in Subject
              </button>
            </form>
          </div>
        </div>

        {/* Batch Assign by Semester */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-collection-fill text-success me-2"></i>Batch Assign by Semester
            </h5>
            <p className="text-secondary small mb-3">
              Quickly assigns all accredited curriculum subjects for a chosen semester to the selected student in one click.
            </p>
            <form onSubmit={handleBatchAssign}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Choose Semester Curriculum</label>
                <select
                  className="form-select"
                  value={batchSemester}
                  onChange={(e) => setBatchSemester(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s} Curriculum
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-light rounded-3 border small text-muted mb-3">
                <i className="bi bi-info-circle me-1 text-primary"></i>
                Subjects already assigned to this student will be safely skipped to avoid duplicates.
              </div>

              <button type="submit" className="btn btn-success w-100 fw-semibold rounded-3 py-2">
                <i className="bi bi-lightning-charge-fill me-1"></i>Batch Assign Semester {batchSemester}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Currently Assigned Subjects Table for Selected Student */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            Currently Enrolled Subjects ({assignedRecords.length} Subjects)
          </h6>
          <span className="small text-secondary">
            Total Credits:{' '}
            <strong className="text-primary">
              {assignedRecords.reduce((sum, r) => sum + (r.subjectId?.credits || 0), 0)} Credits
            </strong>
          </span>
        </div>

        {fetchingRecords ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary"></div>
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
                  <th className="text-center">Credits</th>
                  <th className="text-center">Marks</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">Status</th>
                  <th className="text-end pe-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedRecords.length > 0 ? (
                  assignedRecords.map((item) => (
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
                      <td className="text-center fw-bold">{item.subjectId?.credits}</td>
                      <td className="text-center">{item.marks !== null ? item.marks : '—'}</td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border">{item.grade || '—'}</span>
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
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveAssignment(item._id, item.subjectId?.subjectName)}
                          title="Unassign Subject"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">
                      No subjects currently assigned to this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignSubjects;
