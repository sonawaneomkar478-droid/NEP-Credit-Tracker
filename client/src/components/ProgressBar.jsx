import React from 'react';

const ProgressBar = ({
  progress = 0,
  earned = 0,
  required = 80,
  showLabel = true,
  height = '1.25rem',
  animated = true,
}) => {
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const isCompleted = safeProgress >= 100 || earned >= required;

  // Choose color based on progress percentage
  let barColorClass = 'bg-info';
  if (safeProgress >= 100) {
    barColorClass = 'bg-success';
  } else if (safeProgress >= 70) {
    barColorClass = 'bg-primary';
  } else if (safeProgress >= 40) {
    barColorClass = 'bg-primary';
  } else {
    barColorClass = 'bg-warning';
  }

  return (
    <div className="w-100">
      {showLabel && (
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">Degree Credit Completion</span>
            {isCompleted ? (
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                <i className="bi bi-check-circle-fill me-1"></i>Completed
              </span>
            ) : (
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                {safeProgress}% Progress
              </span>
            )}
          </div>
          <span className="text-secondary small fw-semibold">
            {earned} of {required} Credits
          </span>
        </div>
      )}

      <div
        className="progress bg-light-subtle border rounded-pill shadow-inner overflow-hidden"
        style={{ height, padding: '2px', backgroundColor: '#e9ecef' }}
      >
        <div
          className={`progress-bar rounded-pill fw-bold ${barColorClass} ${
            animated ? 'progress-bar-striped progress-bar-animated' : ''
          }`}
          role="progressbar"
          style={{
            width: `${safeProgress}%`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '0.75rem',
          }}
          aria-valuenow={safeProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {safeProgress > 12 ? `${safeProgress}%` : ''}
        </div>
      </div>

      {/* Degree Milestones */}
      <div className="d-flex justify-content-between mt-2 text-secondary small px-1" style={{ fontSize: '0.72rem' }}>
        <span className={safeProgress >= 0 ? 'text-primary fw-bold' : ''}>Start (0 Cr)</span>
        <span className={safeProgress >= 25 ? 'text-primary fw-bold' : ''}>Year 1 (~20 Cr)</span>
        <span className={safeProgress >= 50 ? 'text-primary fw-bold' : ''}>Halfway (40 Cr)</span>
        <span className={safeProgress >= 75 ? 'text-primary fw-bold' : ''}>Senior (~60 Cr)</span>
        <span className={safeProgress >= 100 ? 'text-success fw-bold' : ''}>Graduate ({required} Cr)</span>
      </div>
    </div>
  );
};

export default ProgressBar;
