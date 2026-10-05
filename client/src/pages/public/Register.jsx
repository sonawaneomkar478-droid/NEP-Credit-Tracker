import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    studentId: '',
    course: 'M.Sc. Computer Science',
    department: 'Department of Computer Science',
    academicYear: '2024-2026',
    division: 'A',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.name || !formData.email || !formData.password || !formData.rollNumber) {
      setError('Please fill in all required fields (Name, Email, Password, Roll Number).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5 px-3 d-flex align-items-center justify-content-center">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '680px', width: '100%' }}>
        <div className="bg-primary text-white p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="fw-bold mb-1">Student NEP Enrollment</h4>
              <p className="small text-white-50 mb-0">Create your academic account to start tracking degree credits</p>
            </div>
            <div className="bg-white text-primary rounded-circle p-3 d-none d-sm-block">
              <i className="bi bi-mortarboard fs-3"></i>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show small d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="bi bi-exclamation-octagon-fill flex-shrink-0"></i>
              <div>{error}</div>
              <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">1. Personal & Account Details</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Rahul Patil"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="name@nepcredit.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Password * (min 6 chars)</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Student ID (Optional)</label>
                <input
                  type="text"
                  name="studentId"
                  className="form-control text-uppercase"
                  placeholder="Auto-generated if empty"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 mt-4">2. Academic Information</h6>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Roll Number *</label>
                <input
                  type="text"
                  name="rollNumber"
                  className="form-control"
                  placeholder="e.g. MCS-2024-045"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Course</label>
                <select name="course" className="form-select" value={formData.course} onChange={handleChange}>
                  <option value="M.Sc. Computer Science">M.Sc. Computer Science (80 Credits)</option>
                  <option value="M.Sc. Data Science">M.Sc. Data Science (80 Credits)</option>
                  <option value="M.Sc. Information Technology">M.Sc. Information Technology (80 Credits)</option>
                  <option value="B.Sc. Computer Science">B.Sc. Computer Science (120 Credits)</option>
                  <option value="B.Sc. Information Technology">B.Sc. Information Technology (120 Credits)</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Academic Year</label>
                <input
                  type="text"
                  name="academicYear"
                  className="form-control"
                  value={formData.academicYear}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Division</label>
                <input
                  type="text"
                  name="division"
                  className="form-control"
                  value={formData.division}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Registering Student Account...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-person-check-fill"></i>
                  <span>Complete Registration & Open Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center small text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
