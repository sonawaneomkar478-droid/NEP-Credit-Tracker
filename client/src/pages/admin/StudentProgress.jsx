import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/api';

const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentService.getAll();
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch student progress data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filtered = students.filter((st) => {
    const matchSearch =
      st.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const pct = st.progressPercentage || 0;
    let matchFilter = true;
    if (statusFilter === 'COMPLETED') matchFilter = pct >= 100 || st.isRequirementCompleted;
    else if (statusFilter === 'ON_TRACK') matchFilter = pct >= 50 && pct < 100;
    else if (statusFilter === 'NEEDS_ATTENTION') matchFilter = pct < 50;

    return matchSearch && matchFilter;
  });

  const totalCount = students.length;
  const completedCount = students.filter((s) => s.isRequirementCompleted || s.progressPercentage >= 100).length;
  const onTrackCount = students.filter((s) => s.progressPercentage >= 50 && s.progressPercentage < 100).length;
  const needsAttentionCount = students.filter((s) => (s.progressPercentage || 0) < 50).length;

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Student Credit Progress Monitoring</h3>
        <p className="text-secondary small mb-0">
          Track degree completion metrics across cohorts and identify students meeting graduation thresholds
        </p>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Cohort Metric Counters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 bg-white cursor-pointer ${
              statusFilter === 'ALL' ? 'border-primary border-2' : ''
            }`}
            onClick={() => setStatusFilter('ALL')}
          >
            <span className="text-secondary small fw-semibold text-uppercase">Total Monitored</span>
            <div className="fs-3 fw-bold text-dark mt-1">{totalCount} Students</div>
            <small className="text-primary">Click to view all</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 bg-white cursor-pointer ${
              statusFilter === 'COMPLETED' ? 'border-success border-2' : ''
            }`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            <span className="text-secondary small fw-semibold text-uppercase">Degree Completed</span>
            <div className="fs-3 fw-bold text-success mt-1">{completedCount} Students</div>
            <small className="text-success">&ge; 80 Credits Met (100%)</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 bg-white cursor-pointer ${
              statusFilter === 'ON_TRACK' ? 'border-primary border-2' : ''
            }`}
            onClick={() => setStatusFilter('ON_TRACK')}
          >
            <span className="text-secondary small fw-semibold text-uppercase">On Track (50% - 99%)</span>
            <div className="fs-3 fw-bold text-primary mt-1">{onTrackCount} Students</div>
            <small className="text-secondary">Expected 2nd Year Senior</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className={`card border-0 shadow-sm rounded-4 p-3 bg-white cursor-pointer ${
              statusFilter === 'NEEDS_ATTENTION' ? 'border-warning border-2' : ''
            }`}
            onClick={() => setStatusFilter('NEEDS_ATTENTION')}
          >
            <span className="text-secondary small fw-semibold text-uppercase">Early Phase (&lt;50%)</span>
            <div className="fs-3 fw-bold text-warning-emphasis mt-1">{needsAttentionCount} Students</div>
            <small className="text-secondary">Semester 1-2 Focus</small>
          </div>
        </div>
      </div>

      {/* Progress Cards List */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white p-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="input-group input-group-sm" style={{ maxWidth: '340px' }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-secondary"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Filter student name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-secondary">Filter Category:</span>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Cohort ({totalCount})</option>
              <option value="COMPLETED">Completed ({completedCount})</option>
              <option value="ON_TRACK">On Track ({onTrackCount})</option>
              <option value="NEEDS_ATTENTION">Early Stage ({needsAttentionCount})</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-secondary small">Gathering progress meters...</p>
          </div>
        ) : (
          <div className="p-3">
            <div className="row g-3">
              {filtered.map((st) => {
                const pct = st.progressPercentage || 0;
                const isDone = st.isRequirementCompleted || pct >= 100;

                return (
                  <div key={st._id} className="col-12 col-lg-6">
                    <div className="card border rounded-4 p-3 h-100 bg-light-subtle">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold text-dark mb-0">{st.name}</h6>
                          <div className="text-muted small">
                            {st.studentId} • Roll: {st.rollNumber} • {st.course}
                          </div>
                        </div>
                        {isDone ? (
                          <span className="badge bg-success rounded-pill px-3 py-1">
                            <i className="bi bi-patch-check-fill me-1"></i>Completed
                          </span>
                        ) : (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
                            {st.remainingCredits} Cr Left
                          </span>
                        )}
                      </div>

                      {/* Progress Meter */}
                      <div className="my-3">
                        <div className="d-flex justify-content-between small text-secondary mb-1">
                          <span>Credits Earned</span>
                          <strong>
                            <span className="text-success fw-bold">{st.earnedCredits || 0}</span> / {st.requiredCredits} Cr ({pct}%)
                          </strong>
                        </div>
                        <div className="progress" style={{ height: '10px' }}>
                          <div
                            className={`progress-bar ${isDone ? 'bg-success' : pct >= 50 ? 'bg-primary' : 'bg-warning'}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Quick links */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top small">
                        <span className="text-muted">Batch: {st.academicYear}</span>
                        <div className="d-flex gap-2">
                          <Link to="/admin/manage-marks" className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-pencil-square me-1"></i>Grade
                          </Link>
                          <Link to="/admin/reports" className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-file-earmark-text me-1"></i>Report
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
