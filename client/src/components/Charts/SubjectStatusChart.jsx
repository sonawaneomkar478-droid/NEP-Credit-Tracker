import React from 'react';
import './chartSetup';
import { Doughnut } from 'react-chartjs-2';

const SubjectStatusChart = ({ completed = 0, inProgress = 0, pending = 0 }) => {
  const total = completed + inProgress + pending;

  const data = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: total > 0 ? [completed, inProgress, pending] : [1, 0, 0],
        backgroundColor: ['#198754', '#0d6efd', '#ffc107'],
        hoverBackgroundColor: ['#157347', '#0b5ed7', '#e0a800'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
            return ` ${label}: ${value} subjects (${pct}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="position-relative" style={{ height: '220px' }}>
      <Doughnut data={data} options={options} />
      <div
        className="position-absolute top-50 start-50 translate-middle text-center"
        style={{ pointerEvents: 'none', marginTop: '-15px' }}
      >
        <span className="fs-3 fw-bold text-dark">{total}</span>
        <span className="text-secondary small d-block" style={{ fontSize: '0.72rem' }}>
          Subjects
        </span>
      </div>
    </div>
  );
};

export default SubjectStatusChart;
