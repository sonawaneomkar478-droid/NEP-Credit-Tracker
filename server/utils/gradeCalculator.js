/**
 * Calculate Grade and Grade Points based on NEP 10-point scale
 * @param {number|null} marks
 * @returns {{ grade: string, points: number, description: string }}
 */
const calculateGrade = (marks) => {
  if (marks === null || marks === undefined || isNaN(marks)) {
    return { grade: 'Pending', points: 0, description: 'Not Graded' };
  }

  const m = Number(marks);
  if (m >= 90) return { grade: 'O', points: 10, description: 'Outstanding' };
  if (m >= 80) return { grade: 'A+', points: 9, description: 'Excellent' };
  if (m >= 70) return { grade: 'A', points: 8, description: 'Very Good' };
  if (m >= 60) return { grade: 'B+', points: 7, description: 'Good' };
  if (m >= 55) return { grade: 'B', points: 6, description: 'Above Average' };
  if (m >= 50) return { grade: 'C', points: 5, description: 'Average' };
  if (m >= 40) return { grade: 'P', points: 4, description: 'Pass' };
  return { grade: 'F', points: 0, description: 'Fail' };
};

module.exports = { calculateGrade };
