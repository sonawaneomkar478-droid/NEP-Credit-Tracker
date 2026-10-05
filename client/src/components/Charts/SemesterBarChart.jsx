import React from 'react';
import './chartSetup';
import { Bar } from 'react-chartjs-2';

const SemesterBarChart = ({ semesterData = [] }) => {
  // Sort semesters
  const sorted = [...semesterData].sort((a, b) => a.semester - b.semester);

  const labels = sorted.length > 0 ? sorted.map((s) => `Sem ${s.semester}`) : ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const earnedValues = sorted.length > 0 ? sorted.map((s) => s.earnedCredits) : [0, 0, 0, 0];
  const totalValues = sorted.length > 0 ? sorted.map((s) => s.totalCredits) : [0, 0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        label: 'Earned Credits',
        data: earnedValues,
        backgroundColor: '#0d6efd',
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Total Assigned Credits',
        data: totalValues,
        backgroundColor: '#e2e8f0',
        borderRadius: 6,
        barPercentage: 0.6,
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
          afterBody: (context) => {
            const index = context[0].dataIndex;
            const sem = sorted[index];
            if (sem) {
              return `Completed: ${sem.completedCount || 0} subjects\nIn Progress: ${sem.inProgressCount || 0}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { stepSize: 4 },
        title: {
          display: true,
          text: 'Credits',
          font: { size: 11, weight: '500' },
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ height: '240px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default SemesterBarChart;
