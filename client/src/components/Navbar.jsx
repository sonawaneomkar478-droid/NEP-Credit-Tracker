import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, student, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm px-3 app-navbar">
      <div className="container-fluid">
        {/* Toggle Sidebar Button for Mobile & Desktop */}
        {isAuthenticated && (
          <button
            className="btn btn-outline-light btn-sm me-3 border-0"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list fs-5"></i>
          </button>
        )}

        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/">
          <span className="bg-primary text-white rounded p-1 px-2 me-2">
            <i className="bi bi-mortarboard-fill"></i>
          </span>
          <span className="brand-title">NEP Credit Tracker</span>
          <span className="badge bg-secondary ms-2 d-none d-sm-inline-block small">v1.0</span>
        </Link>

        {/* Right Section */}
        <div className="ms-auto d-flex align-items-center">
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-md-flex flex-column text-end">
                <span className="text-white fw-semibold small">
                  {user?.name}
                  {user?.role === 'admin' ? (
                    <span className="badge bg-danger ms-2">Admin</span>
                  ) : (
                    <span className="badge bg-success ms-2">Student</span>
                  )}
                </span>
                {student && (
                  <span className="text-light-muted text-secondary small" style={{ fontSize: '0.75rem' }}>
                    {student.studentId} • {student.course}
                  </span>
                )}
              </div>

              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-1"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-6"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userDropdown">
                  <li>
                    <h6 className="dropdown-header">{user?.name}</h6>
                  </li>
                  {user?.role === 'student' ? (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/student/profile">
                          <i className="bi bi-person me-2 text-primary"></i>My Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/student/academic-report">
                          <i className="bi bi-file-earmark-text me-2 text-info"></i>Academic Report
                        </Link>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link className="dropdown-item" to="/admin/dashboard">
                        <i className="bi bi-speedometer2 me-2 text-primary"></i>Admin Overview
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-sm btn-outline-light">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
