import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/api';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal form state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const initialFormState = {
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    studentId: '',
    course: 'M.Sc. Computer Science',
    department: 'Department of Computer Science',
    academicYear: '2024-2026',
    division: 'A',
    phone: '',
    requiredCredits: 80,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAll();
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch student directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormError('');
    setModalMode('add');
    setSelectedStudentId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setFormData({
      name: st.name || '',
      email: st.email || '',
      password: '',
      rollNumber: st.rollNumber || '',
      studentId: st.studentId || '',
      course: st.course || 'M.Sc. Computer Science',
      department: st.department || 'Department of Computer Science',
      academicYear: st.academicYear || '2024-2026',
      division: st.division || 'A',
      phone: st.phone || '',
      requiredCredits: st.requiredCredits || 80,
    });
    setFormError('');
    setModalMode('edit');
    setSelectedStudentId(st._id);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.rollNumber) {
      setFormError('Please enter Name, Email, and Roll Number.');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        const res = await studentService.create(formData);
        if (res.data.success) {
          setSuccessMsg(`Student "${formData.name}" added successfully.`);
          setShowModal(false);
          fetchStudents();
        }
      } else {
        const res = await studentService.update(selectedStudentId, formData);
        if (res.data.success) {
          setSuccessMsg(`Student "${formData.name}" updated successfully.`);
          setShowModal(false);
          fetchStudents();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await studentService.delete(studentToDelete._id);
      setSuccessMsg(`Student "${studentToDelete.name}" and associated records deleted.`);
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
      setShowDeleteModal(false);
    }
  };

  const filteredStudents = students.filter(
    (st) =>
      st.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Student Management</h3>
          <p className="text-secondary small mb-0">
            Maintain registered students, profile particulars, and graduation credit requirements
          </p>
        </div>

        <button className="btn btn-primary fw-semibold rounded-pill px-4 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-person-plus-fill me-2"></i>Add New Student
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 small" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 small" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Main Student Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white p-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="input-group input-group-sm" style={{ maxWidth: '340px' }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-secondary"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Search by name, ID, roll no, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchTerm('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          <div className="small text-secondary">
            Total Enrolled: <strong className="text-dark">{filteredStudents.length}</strong> Students
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-secondary small">Loading student directory...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary text-uppercase">
                <tr>
                  <th className="ps-3 py-3">Student Name</th>
                  <th>Student ID</th>
                  <th>Roll No</th>
                  <th>Course & Batch</th>
                  <th className="text-center">Earned / Required</th>
                  <th style={{ width: '22%' }}>Credit Progress</th>
                  <th className="text-end pe-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st) => (
                    <tr key={st._id}>
                      <td className="ps-3 py-3">
                        <div className="fw-bold text-dark">{st.name}</div>
                        <div className="text-muted small">{st.email}</div>
                      </td>
                      <td className="font-monospace text-muted small">{st.studentId}</td>
                      <td className="font-monospace fw-semibold small">{st.rollNumber}</td>
                      <td>
                        <div className="text-dark small fw-semibold">{st.course}</div>
                        <div className="text-muted small">{st.academicYear} (Div {st.division})</div>
                      </td>
                      <td className="text-center fw-semibold">
                        <span className="text-success">{st.earnedCredits || 0}</span> / {st.requiredCredits} Cr
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '7px' }}>
                            <div
                              className={`progress-bar ${
                                st.progressPercentage >= 100
                                  ? 'bg-success'
                                  : st.progressPercentage >= 50
                                  ? 'bg-primary'
                                  : 'bg-warning'
                              }`}
                              style={{ width: `${st.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="small fw-bold text-dark" style={{ minWidth: '35px' }}>
                            {st.progressPercentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="text-end pe-3">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleOpenEdit(st)}
                            title="Edit Student Details"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => {
                              setStudentToDelete(st);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Student"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No students found matching "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'add' ? 'Add New Student' : `Edit Student (${formData.name})`}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger small mb-3">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {formError}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    {modalMode === 'add' && (
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Default Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Defaults to student123"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Roll Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. MCS-2024-099"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Student ID (Leave empty to auto-generate)</label>
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        placeholder="e.g. STU2024099"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Degree / Program</label>
                      <select
                        className="form-select"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      >
                        <option value="M.Sc. Computer Science">M.Sc. Computer Science (80 Credits)</option>
                        <option value="M.Sc. Data Science">M.Sc. Data Science (80 Credits)</option>
                        <option value="M.Sc. Information Technology">M.Sc. Information Technology (80 Credits)</option>
                        <option value="B.Sc. Computer Science">B.Sc. Computer Science (120 Credits)</option>
                        <option value="B.Sc. Information Technology">B.Sc. Information Technology (120 Credits)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Academic Department</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Academic Batch</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Division</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Contact Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+91 98765 00000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Required Graduation Credits</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="200"
                        value={formData.requiredCredits}
                        onChange={(e) => setFormData({ ...formData, requiredCredits: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={submitting}>
                    {submitting ? 'Saving...' : modalMode === 'add' ? 'Create Student' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>Confirm Student Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  Are you sure you want to permanently delete student{' '}
                  <strong className="text-dark">{studentToDelete?.name}</strong> (Roll No:{' '}
                  {studentToDelete?.rollNumber})?
                </p>
                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  <strong>Caution:</strong> This action will delete the student user account and all assigned subject
                  grades and credit records from MongoDB. This cannot be undone.
                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger px-4 fw-semibold" onClick={handleConfirmDelete}>
                  Yes, Delete Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
