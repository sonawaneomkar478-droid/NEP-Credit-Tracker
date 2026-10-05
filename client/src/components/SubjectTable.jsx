import React, { useState, useMemo } from 'react';

const SubjectTable = ({
  records = [],
  isAdmin = false,
  onEditRecord,
  onDeleteRecord,
  showFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Badges styling map
  const typeBadgeMap = {
    Core: 'badge bg-primary-subtle text-primary border border-primary-subtle',
    Elective: 'badge bg-purple-subtle text-indigo border border-indigo-subtle',
    Practical: 'badge bg-info-subtle text-info border border-info-subtle',
    Project: 'badge bg-success-subtle text-success border border-success-subtle',
    Internship: 'badge bg-warning-subtle text-warning border border-warning-subtle',
    'Skill-based': 'badge bg-dark-subtle text-dark border border-secondary-subtle',
  };

  const statusBadgeMap = {
    Completed: 'badge bg-success text-white',
    'In Progress': 'badge bg-primary text-white',
    Pending: 'badge bg-warning text-dark',
  };

  const gradeBadgeMap = {
    O: 'badge bg-success-subtle text-success border border-success',
    'A+': 'badge bg-primary-subtle text-primary border border-primary',
    A: 'badge bg-info-subtle text-info border border-info',
    'B+': 'badge bg-info-subtle text-secondary border border-secondary',
    B: 'badge bg-secondary-subtle text-secondary border border-secondary',
    C: 'badge bg-warning-subtle text-warning border border-warning',
    P: 'badge bg-warning-subtle text-dark border border-warning',
    F: 'badge bg-danger text-white',
    Pending: 'badge bg-light text-muted border',
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const subject = item.subjectId || item;
      const subCode = subject.subjectCode || item.subjectCode || '';
      const subName = subject.subjectName || item.subjectName || '';
      const sem = item.semester || subject.semester;
      const st = item.status || 'Pending';
      const type = subject.subjectType || item.subjectType || 'Core';

      const matchSearch =
        subCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSem = selectedSemester === 'ALL' || Number(sem) === Number(selectedSemester);
      const matchStatus = selectedStatus === 'ALL' || st === selectedStatus;
      const matchType = selectedType === 'ALL' || type === selectedType;

      return matchSearch && matchSem && matchStatus && matchType;
    });
  }, [records, searchTerm, selectedSemester, selectedStatus, selectedType]);

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      {/* Search and Filters Header */}
      {showFilters && (
        <div className="card-header bg-white p-3 border-bottom">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search subject code or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Semester Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm bg-light"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm bg-light"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="col-12 col-md-3">
              <select
                className="form-select form-select-sm bg-light"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
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
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-secondary small text-uppercase">
            <tr>
              <th scope="col" className="ps-3 py-3">Subject</th>
              <th scope="col" className="text-center py-3">Sem</th>
              <th scope="col" className="py-3">Type</th>
              <th scope="col" className="text-center py-3">Credits</th>
              <th scope="col" className="text-center py-3">Marks</th>
              <th scope="col" className="text-center py-3">Grade</th>
              <th scope="col" className="text-center py-3">Status</th>
              {isAdmin && <th scope="col" className="text-end pe-3 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((item) => {
                const subject = item.subjectId || item;
                const subCode = subject.subjectCode || item.subjectCode;
                const subName = subject.subjectName || item.subjectName;
                const sem = item.semester || subject.semester;
                const credits = subject.credits || item.credits;
                const type = subject.subjectType || item.subjectType || 'Core';
                const status = item.status || 'Pending';
                const marks = item.marks !== null && item.marks !== undefined ? item.marks : '—';
                const grade = item.grade || 'Pending';

                return (
                  <tr key={item._id || subCode}>
                    <td className="ps-3 py-3">
                      <div className="fw-bold text-dark">{subName}</div>
                      <div className="text-muted small font-monospace">{subCode}</div>
                    </td>
                    <td className="text-center">
                      <span className="badge rounded-pill bg-light text-dark border">
                        Sem {sem}
                      </span>
                    </td>
                    <td>
                      <span className={typeBadgeMap[type] || 'badge bg-light text-dark'}>
                        {type}
                      </span>
                    </td>
                    <td className="text-center fw-bold text-dark">{credits}</td>
                    <td className="text-center">
                      {marks !== '—' ? (
                        <span className="fw-semibold">{marks} / 100</span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={gradeBadgeMap[grade] || 'badge bg-light text-dark'}>
                        {grade}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={statusBadgeMap[status] || 'badge bg-secondary'}>
                        {status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="text-end pe-3">
                        <div className="btn-group btn-group-sm">
                          {onEditRecord && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => onEditRecord(item)}
                              title="Update Marks, Grade, Status"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          )}
                          {onDeleteRecord && (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => onDeleteRecord(item)}
                              title="Remove Subject Assignment"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="text-center py-5 text-muted">
                  <div className="d-flex flex-column align-items-center">
                    <i className="bi bi-folder-x fs-1 text-secondary opacity-50 mb-2"></i>
                    <p className="mb-0 fw-semibold">No subjects match the selected criteria.</p>
                    <small className="text-secondary">Try clearing the search or filter options.</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="card-footer bg-white border-top py-2 px-3 d-flex justify-content-between align-items-center text-secondary small">
        <span>Showing {filteredRecords.length} of {records.length} subjects</span>
        <span>
          Earned Credits in view:{' '}
          <strong className="text-success">
            {filteredRecords
              .filter((r) => r.status === 'Completed')
              .reduce((sum, r) => sum + (r.subjectId?.credits || r.credits || 0), 0)}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default SubjectTable;
