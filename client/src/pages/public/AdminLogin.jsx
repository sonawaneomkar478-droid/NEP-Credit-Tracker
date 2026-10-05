import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide admin credentials.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (user.role !== 'admin') {
        setError('This portal is restricted to academic administrators. Please sign in via the student portal.');
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@nepcredit.edu');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="bg-dark text-white p-4 text-center">
          <div className="bg-white text-dark rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
            <i className="bi bi-shield-lock-fill fs-3 text-danger"></i>
          </div>
          <h4 className="fw-bold mb-1">Admin Console</h4>
          <p className="small text-white-50 mb-0">Authorized Academic Administration Access</p>
        </div>

        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show small d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <div>{error}</div>
              <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Admin Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person-fill-lock text-secondary"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="admin@nepcredit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Master Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-key-fill text-secondary"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Verifying Admin Rights...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check"></i>
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Quick fill button */}
          <div className="mt-4 pt-3 border-top text-center">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm w-100"
              onClick={fillAdmin}
            >
              <i className="bi bi-lightning-fill me-1"></i>Fill Admin Credentials (admin@nepcredit.edu)
            </button>
          </div>

          <div className="mt-3 text-center small">
            <Link to="/login" className="text-secondary text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i>Back to Student Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
