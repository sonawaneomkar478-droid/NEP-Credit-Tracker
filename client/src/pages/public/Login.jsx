import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/student/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from === '/login' || from === '/admin/dashboard' ? '/student/dashboard' : from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="bg-primary text-white p-4 text-center">
          <div className="bg-white text-primary rounded-circle d-inline-flex p-3 mb-2 shadow-sm">
            <i className="bi bi-mortarboard-fill fs-3"></i>
          </div>
          <h4 className="fw-bold mb-1">Student Portal</h4>
          <p className="small text-white-50 mb-0">Sign in to track your NEP academic credits</p>
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
              <label className="form-label small fw-semibold text-secondary">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-secondary"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="name@nepcredit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-secondary"></i>
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
              className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Sign In as Student</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Helpers */}
          <div className="mt-4 pt-3 border-top">
            <div className="text-secondary small fw-semibold mb-2 text-center">
              Quick Test Autofill (Viva Demo):
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-fill"
                onClick={() => fillCredentials('aarav.sharma@nepcredit.edu', 'student123')}
              >
                Aarav (65%)
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm flex-fill"
                onClick={() => fillCredentials('priya.patel@nepcredit.edu', 'student123')}
              >
                Priya (100%)
              </button>
            </div>
          </div>

          <div className="mt-3 text-center small text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
              Register as Student
            </Link>
          </div>

          <div className="mt-2 text-center small">
            <Link to="/admin-login" className="text-secondary text-decoration-none">
              <i className="bi bi-shield-lock me-1"></i>Switch to Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
