import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/api';

const Profile = () => {
  const { user, student, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    division: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (student) {
      setFormData({
        phone: student.phone || '',
        division: student.division || 'A',
      });
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student?._id) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await studentService.update(student._id, formData);
      if (res.data.success) {
        await refreshProfile();
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile contact details updated successfully!' });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Student Academic Profile</h3>
          <p className="text-secondary small mb-0">View registered credentials and degree curriculum information</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3 small`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: ID Card */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4 bg-white">
            <div className="d-flex justify-content-center mb-3">
              <div
                className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '96px', height: '96px', fontSize: '2.5rem' }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
            </div>
            <h5 className="fw-bold text-dark mb-1">{user?.name}</h5>
            <span className="badge bg-primary rounded-pill mb-2 px-3 py-1 font-monospace">
              {student?.studentId || 'ID PENDING'}
            </span>
            <p className="text-secondary small mb-3">{student?.course}</p>

            <div className="bg-light p-3 rounded-3 text-start small border">
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-secondary">Roll Number:</span>
                <strong className="text-dark">{student?.rollNumber}</strong>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-secondary">Academic Year:</span>
                <strong className="text-dark">{student?.academicYear}</strong>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-secondary">Division:</span>
                <strong className="text-dark">{student?.division || 'A'}</strong>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-secondary">NEP Requirement:</span>
                <strong className="text-primary">{student?.requiredCredits} Credits</strong>
              </div>
            </div>

            <div className="mt-4 p-3 bg-warning-subtle text-warning-emphasis rounded-3 text-start small border border-warning-subtle">
              <i className="bi bi-shield-lock-fill me-1"></i>
              <strong>Academic Governance Note:</strong> Under NEP 2020 guidelines, core student credentials, course, and earned credits are audited by the college administration.
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Fields & Editable Contact Details */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 className="fw-bold text-dark mb-0">Academic & Personal Particulars</h5>
              {!isEditing ? (
                <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil me-1"></i>Edit Contact Info
                </button>
              ) : (
                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Full Student Name</label>
                  <input type="text" className="form-control bg-light" value={user?.name || ''} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Registered Email Address</label>
                  <input type="email" className="form-control bg-light" value={user?.email || ''} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Student ID (NEP Unique ID)</label>
                  <input type="text" className="form-control bg-light font-monospace" value={student?.studentId || ''} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Roll Number</label>
                  <input type="text" className="form-control bg-light font-monospace" value={student?.rollNumber || ''} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Degree / Course</label>
                  <input type="text" className="form-control bg-light" value={student?.course || ''} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Academic Department</label>
                  <input type="text" className="form-control bg-light" value={student?.department || ''} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Contact Phone</label>
                  <input
                    type="text"
                    className={`form-control ${isEditing ? '' : 'bg-light'}`}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    readOnly={!isEditing}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Division / Section</label>
                  <input
                    type="text"
                    className={`form-control ${isEditing ? '' : 'bg-light'}`}
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    readOnly={!isEditing}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Graduation Required Credits</label>
                  <input
                    type="text"
                    className="form-control bg-light fw-bold text-primary"
                    value={`${student?.requiredCredits || 80} Credits`}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Academic Batch</label>
                  <input type="text" className="form-control bg-light" value={student?.academicYear || '2024-2026'} readOnly />
                </div>
              </div>

              {isEditing && (
                <div className="mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-light" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={loading}>
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
