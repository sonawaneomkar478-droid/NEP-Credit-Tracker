import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Landing = () => {
  const { isAuthenticated, isStudent, isAdmin, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password) => {
    try {
      const { user } = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-5 shadow-sm">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-20 text-white mb-3">
                <i className="bi bi-mortarboard-fill"></i>
                <span className="small fw-semibold">National Education Policy (NEP 2020) Compliant</span>
              </div>
              <h1 className="display-4 fw-bolder mb-3 tracking-tight">
                Student NEP Credit Tracker
              </h1>
              <p className="lead opacity-90 mb-4 fs-5" style={{ maxWidth: '640px' }}>
                A centralized academic credit management system designed for students and administrators to track
                course credits, monitor degree progress, and generate official semester transcripts.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                    className="btn btn-light btn-lg px-4 fw-bold shadow-sm"
                  >
                    <i className="bi bi-speedometer2 me-2"></i>Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-light btn-lg px-4 fw-bold shadow-sm text-primary">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Student Login
                    </Link>
                    <Link to="/admin-login" className="btn btn-outline-light btn-lg px-4 fw-semibold">
                      <i className="bi bi-shield-lock me-2"></i>Admin Portal
                    </Link>
                    <Link to="/register" className="btn btn-success btn-lg px-4 fw-semibold">
                      <i className="bi bi-person-plus me-2"></i>Register
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-5">
              {/* NEP Formula Demonstration Preview Card */}
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden text-dark bg-white">
                <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold small">
                    <i className="bi bi-calculator me-2 text-warning"></i>NEP Credit Engine
                  </span>
                  <span className="badge bg-success">Automated</span>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>Credit Progress Example</span>
                      <strong className="text-primary">65% Completed</strong>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div className="progress-bar bg-primary" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  <div className="row g-2 text-center mb-3">
                    <div className="col-4">
                      <div className="p-2 rounded bg-light border">
                        <small className="text-secondary d-block">Required</small>
                        <strong className="fs-5 text-dark">80</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-success-subtle border border-success-subtle">
                        <small className="text-success d-block">Earned</small>
                        <strong className="fs-5 text-success">52</strong>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-2 rounded bg-warning-subtle border border-warning-subtle">
                        <small className="text-warning-emphasis d-block">Remaining</small>
                        <strong className="fs-5 text-dark">28</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light p-3 rounded-3 border small text-secondary">
                    <div className="fw-bold text-dark mb-1">
                      <i className="bi bi-check2-circle text-success me-1"></i> NEP 2020 Mathematical Formula:
                    </div>
                    <div>• <code>Earned Credits = &sum; Completed Subject Credits</code></div>
                    <div>• <code>Remaining = Max(0, Required &minus; Earned)</code></div>
                    <div>• <code>Progress % = (Earned / Required) &times; 100</code></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Demo Login Bar for Viva Examiners */}
      <section className="bg-white border-bottom py-4">
        <div className="container">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge bg-primary px-3 py-2 fs-6">
              <i className="bi bi-lightning-charge-fill me-1"></i>Quick Demo Logins (Viva-Ready)
            </span>
            <span className="text-secondary small">Click any card below to test instantly with pre-seeded data:</span>
          </div>

          <div className="row g-3">
            {/* Demo Student 1 */}
            <div className="col-md-4">
              <div
                className="card h-100 border shadow-sm rounded-3 p-3 hover-card cursor-pointer"
                onClick={() => handleQuickLogin('aarav.sharma@nepcredit.edu', 'student123')}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-primary-subtle text-primary mb-1">In Progress (65%)</span>
                    <h6 className="fw-bold mb-0 text-dark">Aarav Sharma</h6>
                    <small className="text-secondary">aarav.sharma@nepcredit.edu</small>
                  </div>
                  <i className="bi bi-box-arrow-in-right fs-4 text-primary"></i>
                </div>
                <div className="mt-2 pt-2 border-top small text-secondary d-flex justify-content-between">
                  <span>Earned: <strong>52 / 80</strong> Credits</span>
                  <span className="text-primary fw-semibold">Click to login &rarr;</span>
                </div>
              </div>
            </div>

            {/* Demo Student 2 */}
            <div className="col-md-4">
              <div
                className="card h-100 border shadow-sm rounded-3 p-3 hover-card cursor-pointer"
                onClick={() => handleQuickLogin('priya.patel@nepcredit.edu', 'student123')}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-success-subtle text-success mb-1">Requirement Completed</span>
                    <h6 className="fw-bold mb-0 text-dark">Priya Patel</h6>
                    <small className="text-secondary">priya.patel@nepcredit.edu</small>
                  </div>
                  <i className="bi bi-check-circle-fill fs-4 text-success"></i>
                </div>
                <div className="mt-2 pt-2 border-top small text-secondary d-flex justify-content-between">
                  <span>Earned: <strong>80 / 80</strong> (100%)</span>
                  <span className="text-success fw-semibold">Click to login &rarr;</span>
                </div>
              </div>
            </div>

            {/* Demo Admin */}
            <div className="col-md-4">
              <div
                className="card h-100 border shadow-sm rounded-3 p-3 hover-card cursor-pointer"
                onClick={() => handleQuickLogin('admin@nepcredit.edu', 'admin123')}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="badge bg-danger-subtle text-danger mb-1">Administrator</span>
                    <h6 className="fw-bold mb-0 text-dark">System Admin</h6>
                    <small className="text-secondary">admin@nepcredit.edu</small>
                  </div>
                  <i className="bi bi-shield-check fs-4 text-danger"></i>
                </div>
                <div className="mt-2 pt-2 border-top small text-secondary d-flex justify-content-between">
                  <span>Full Manage Access</span>
                  <span className="text-danger fw-semibold">Click to login &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Engineered for NEP Academic Governance</h2>
            <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Built according to the National Education Policy curriculum framework, standardizing credits across semesters, subject types, and grading scales.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="p-3 bg-primary-subtle text-primary rounded-4 d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-cpu fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Automated Credit Auditing</h5>
                <p className="text-secondary small mb-0">
                  Dynamic credit computation directly linked to subject completion status, preventing negative values and certifying graduation readiness.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="p-3 bg-success-subtle text-success rounded-4 d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-pie-chart fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Visual Progress Analytics</h5>
                <p className="text-secondary small mb-0">
                  Multi-dimensional visual charts featuring Earned vs Remaining credit doughnuts, Semester-by-semester bars, and Subject status distributions.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-4 d-inline-flex mb-3" style={{ width: 'fit-content' }}>
                  <i className="bi bi-file-earmark-pdf fs-3"></i>
                </div>
                <h5 className="fw-bold text-dark">Official Academic Transcripts</h5>
                <p className="text-secondary small mb-0">
                  Print-ready academic grade cards containing semester subject records, letter grades (O to F), total credits, and institutional validation blocks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-dark text-white-50 py-4 border-top border-secondary">
        <div className="container text-center small">
          <div className="mb-2 text-white fw-bold">Student NEP Credit Tracker • MERN Stack Architecture</div>
          <div>M.Sc. Computer Science Final Year Project • MongoDB + Express.js + React.js + Node.js</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
