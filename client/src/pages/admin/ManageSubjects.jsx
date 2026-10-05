import React, { useState, useEffect } from 'react';
import { subjectService } from '../../services/api';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [filterSem, setFilterSem] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedSubjId, setSelectedSubjId] = useState(null);

  const initialForm = {
    subjectCode: '',
    subjectName: '',
    semester: 1,
    subjectType: 'Core',
    credits: 4,
    description: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectService.getAll();
      if (res.data.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch subjects catalog.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setFormError('');
    setModalMode('add');
    setSelectedSubjId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sub) => {
    setFormData({
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      semester: sub.semester,
      subjectType: sub.subjectType,
      credits: sub.credits,
      description: sub.description || '',
    });
    setFormError('');
    setModalMode('edit');
    setSelectedSubjId(sub._id);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.subjectCode || !formData.subjectName || !formData.credits) {
      setFormError('Subject code, name, and credits are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        const res = await subjectService.create(formData);
        if (res.data.success) {
          setSuccessMsg(`Subject "${formData.subjectName}" created successfully.`);
          setShowModal(false);
          fetchSubjects();
        }
      } else {
        const res = await subjectService.update(selectedSubjId, formData);
        if (res.data.success) {
          setSuccessMsg(`Subject "${formData.subjectName}" updated successfully.`);
          setShowModal(false);
          fetchSubjects();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      await subjectService.delete(subjectToDelete._id);
      setSuccessMsg(`Subject "${subjectToDelete.subjectCode}" deleted.`);
      setShowDeleteModal(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subject.');
      setShowDeleteModal(false);
    }
  };

  const filteredSubjects = subjects.filter((sub) => {
    const matchSearch =
      sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSem = filterSem === 'ALL' || Number(sub.semester) === Number(filterSem);
    const matchType = filterType === 'ALL' || sub.subjectType === filterType;
    return matchSearch && matchSem && matchType;
  });

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Curriculum Subjects Catalog</h3>
          <p className="text-secondary small mb-0">
            Define National Education Policy (NEP) accredited courses, credits, and semester mappings
          </p>
        </div>

        <button className="btn btn-primary fw-semibold rounded-pill px-4 shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-journal-plus me-2"></i>Add New Subject
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

      {/* Main Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {/* Filters Header */}
        <div className="card-header bg-white p-3 border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search code or subject title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm bg-light"
                value={filterSem}
                onChange={(e) => setFilterSem(e.target.value)}
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-4">
              <select
                className="form-select form-select-sm bg-light"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Subject Types</option>
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Practical">Practical</option>
                <option value="Project">Project</option>
                <option value="Internship">Internship</option>
                <option value="Skill-based">Skill-based</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-secondary small">Loading curriculum catalog...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary text-uppercase">
                <tr>
                  <th className="ps-3 py-3">Subject Name</th>
                  <th>Subject Code</th>
                  <th className="text-center">Semester</th>
                  <th>Category</th>
                  <th className="text-center">Credits</th>
                  <th>Description</th>
                  <th className="text-end pe-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((sub) => (
                    <tr key={sub._id}>
                      <td className="ps-3 py-3">
                        <div className="fw-bold text-dark">{sub.subjectName}</div>
                      </td>
                      <td className="font-monospace fw-semibold text-primary">{sub.subjectCode}</td>
                      <td className="text-center">
                        <span className="badge rounded-pill bg-light text-dark border">Sem {sub.semester}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{sub.subjectType}</span>
                      </td>
                      <td className="text-center fw-bold fs-6 text-dark">{sub.credits}</td>
                      <td className="small text-secondary text-truncate" style={{ maxWidth: '240px' }}>
                        {sub.description || '—'}
                      </td>
                      <td className="text-end pe-3">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleOpenEdit(sub)}
                            title="Edit Subject"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => {
                              setSubjectToDelete(sub);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Subject"
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
                      No subjects found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-dark">
                  {modalMode === 'add' ? 'Add Subject to Catalog' : `Edit Subject (${formData.subjectCode})`}
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

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Subject Code *</label>
                    <input
                      type="text"
                      className="form-control font-monospace text-uppercase"
                      placeholder="e.g. CS501"
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Subject Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Advanced Operating Systems"
                      value={formData.subjectName}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Semester *</label>
                      <select
                        className="form-select"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Credits *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="30"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">NEP Subject Category</label>
                    <select
                      className="form-select"
                      value={formData.subjectType}
                      onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                    >
                      <option value="Core">Core</option>
                      <option value="Elective">Elective</option>
                      <option value="Practical">Practical</option>
                      <option value="Project">Project</option>
                      <option value="Internship">Internship</option>
                      <option value="Skill-based">Skill-based</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Syllabus Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Key topics, prerequisites, or laboratory requirements..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={submitting}>
                    {submitting ? 'Saving...' : modalMode === 'add' ? 'Add Subject' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subject Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-trash-fill me-2"></i>Delete Curriculum Subject
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  Are you sure you want to delete{' '}
                  <strong className="text-dark">
                    {subjectToDelete?.subjectCode} — {subjectToDelete?.subjectName}
                  </strong>
                  ?
                </p>
                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Removing this subject will also delete all student enrollment and grade records associated with it.
                </div>
              </div>
              <div className="modal-footer border-top bg-light">
                <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger px-4 fw-semibold" onClick={handleConfirmDelete}>
                  Yes, Delete Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
