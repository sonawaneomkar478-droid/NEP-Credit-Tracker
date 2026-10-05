import React from 'react';
import './chartSetup';
import { Doughnut } from 'react-chartjs-2';

const CreditDoughnutChart = ({ earned = 0, remaining = 0, required = 80 }) => {
  const data = {
    labels: ['Earned Credits', 'Remaining Credits'],
    datasets: [
      {
        data: [earned, remaining],
        backgroundColor: ['#198754', '#e9ecef'],
        hoverBackgroundColor: ['#157347', '#dee2e6'],
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
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12, weight: '500' },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const pct = required > 0 ? ((value / required) * 100).toFixed(1) : 0;
            return ` ${label}: ${value} Credits (${pct}%)`;
          },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="position-relative" style={{ height: '220px' }}>
      <Doughnut data={data} options={options} />
      <div
        className="position-absolute top-50 start-50 translate-middle text-center"
        style={{ pointerEvents: 'none', marginTop: '-15px' }}
      >
        <span className="fs-3 fw-bold text-dark">{earned}</span>
        <span className="text-secondary small d-block" style={{ fontSize: '0.72rem' }}>
          / {required} Cr
        </span>
      </div>
    </div>
  );
};

export default CreditDoughnutChart;
