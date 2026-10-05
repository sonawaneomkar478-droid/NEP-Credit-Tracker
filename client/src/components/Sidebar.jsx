import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onCloseMobile }) => {
  const { user, isStudent, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { to: '/student/profile', icon: 'bi-person-badge-fill', label: 'My Profile' },
    { to: '/student/subjects', icon: 'bi-journal-bookmark-fill', label: 'My Subjects' },
    { to: '/student/semester-details', icon: 'bi-calendar3-range', label: 'Semester Details' },
    { to: '/student/credit-progress', icon: 'bi-pie-chart-fill', label: 'Credit Progress' },
    { to: '/student/credit-history', icon: 'bi-clock-history', label: 'Credit History' },
    { to: '/student/academic-report', icon: 'bi-file-earmark-bar-graph-fill', label: 'Academic Report' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/students', icon: 'bi-people-fill', label: 'Manage Students' },
    { to: '/admin/subjects', icon: 'bi-journals', label: 'Manage Subjects' },
    { to: '/admin/assign-subjects', icon: 'bi-patch-check-fill', label: 'Assign Subjects' },
    { to: '/admin/manage-marks', icon: 'bi-award-fill', label: 'Marks & Grades' },
    { to: '/admin/student-progress', icon: 'bi-graph-up-arrow', label: 'Student Progress' },
    { to: '/admin/reports', icon: 'bi-printer-fill', label: 'Academic Reports' },
  ];

  const links = isStudent ? studentLinks : isAdmin ? adminLinks : [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onCloseMobile}
        ></div>
      )}

      <aside
        className={`app-sidebar bg-white border-end ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{ zIndex: 1045 }}
      >
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <div className="text-uppercase text-secondary fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
              {isStudent ? 'Student Portal' : 'Admin Console'}
            </div>
            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '180px' }}>
              {user?.name || 'Academic User'}
            </div>
          </div>
          <button
            className="btn btn-sm btn-light d-lg-none border-0"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="p-3">
          <ul className="nav nav-pills flex-column gap-1">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-secondary ${
                      isActive ? 'active bg-primary text-white fw-semibold shadow-sm' : 'hover-nav'
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 992) onCloseMobile();
                  }}
                >
                  <i className={`bi ${link.icon} fs-5`}></i>
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {isStudent && (
          <div className="mt-auto p-3 m-3 bg-light rounded-3 border">
            <div className="d-flex align-items-center gap-2 text-primary fw-bold small mb-1">
              <i className="bi bi-info-circle-fill"></i>
              <span>NEP 2020 Framework</span>
            </div>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
              Degrees follow the National Education Policy credit curriculum. 80 Credits required for graduation.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
