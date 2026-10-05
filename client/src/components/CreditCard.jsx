import React from 'react';

const CreditCard = ({ title, value, unit = 'Credits', icon, color = 'primary', subtitle }) => {
  const colorMap = {
    primary: { bg: 'bg-primary-subtle', text: 'text-primary', border: 'border-primary' },
    success: { bg: 'bg-success-subtle', text: 'text-success', border: 'border-success' },
    warning: { bg: 'bg-warning-subtle', text: 'text-warning', border: 'border-warning' },
    info: { bg: 'bg-info-subtle', text: 'text-info', border: 'border-info' },
    danger: { bg: 'bg-danger-subtle', text: 'text-danger', border: 'border-danger' },
    purple: { bg: 'bg-indigo-subtle', text: 'text-indigo', border: 'border-indigo' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 stat-card">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <span className="text-secondary fw-semibold text-uppercase small" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {title}
            </span>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-bold text-dark tracking-tight">{value}</span>
              {unit && <span className="text-secondary small fw-medium">{unit}</span>}
            </div>
          </div>
          <div
            className={`p-3 rounded-4 d-flex align-items-center justify-content-center ${scheme.bg} ${scheme.text}`}
            style={{ width: '52px', height: '52px' }}
          >
            <i className={`bi ${icon} fs-4`}></i>
          </div>
        </div>

        {subtitle && (
          <div className="pt-2 border-top text-secondary small d-flex align-items-center gap-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCard;
