import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { creditService } from '../../services/api';

const CreditHistory = () => {
  const { student } = useAuth();
  const [history, setHistory] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [requiredCredits, setRequiredCredits] = useState(80);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!student?._id) return;
      try {
        setLoading(true);
        const res = await creditService.getCreditHistory(student._id);
        if (res.data.success) {
          setHistory(res.data.history || []);
          setTotalEarned(res.data.totalCreditsEarned || 0);
          setRequiredCredits(res.data.requiredCredits || 80);
        }
      } catch (err) {
        setError('Failed to load credit history records.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [student]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-secondary small">Loading completed credit milestones...</p>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Credit Completion History</h3>
          <p className="text-secondary small mb-0">
            Chronological audit trail of all successfully completed subjects and earned credits
          </p>
        </div>

        <div className="bg-success-subtle border border-success-subtle rounded-pill px-4 py-2 text-success fw-bold shadow-sm">
          <i className="bi bi-patch-check-fill me-2"></i>
          {totalEarned} / {requiredCredits} Credits Earned
        </div>
      </div>

      {history.length > 0 ? (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">Completed Academic Records ({history.length} Subjects)</span>
            <span className="badge bg-light text-secondary border">Audited Log</span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th className="ps-3 py-3">Subject Name & Code</th>
                  <th className="text-center">Semester</th>
                  <th>Category</th>
                  <th className="text-center">Credits Earned</th>
                  <th className="text-center">Marks</th>
                  <th className="text-center">Grade</th>
                  <th className="pe-3 text-end">Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => {
                  const dateStr = item.completedAt
                    ? new Date(item.completedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={item._id || idx}>
                      <td className="ps-3 py-3">
                        <div className="fw-bold text-dark">{item.subjectName}</div>
                        <div className="text-muted small font-monospace">{item.subjectCode}</div>
                      </td>
                      <td className="text-center">
                        <span className="badge rounded-pill bg-light text-dark border">
                          Sem {item.semester}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.subjectType}</span>
                      </td>
                      <td className="text-center fw-bold text-success">+{item.credits} Cr</td>
                      <td className="text-center fw-semibold">
                        {item.marks !== null && item.marks !== undefined ? `${item.marks}/100` : '—'}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success">
                          {item.grade}
                        </span>
                      </td>
                      <td className="pe-3 text-end text-secondary small font-monospace">{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="bi bi-clock-history fs-1 text-secondary opacity-50 mb-3"></i>
          <h5 className="fw-bold text-dark">No Completed Credits Yet</h5>
          <p className="text-secondary small mb-0">
            Once course instructors or administrators award final passing marks and mark your subjects as Completed, they will appear in this audited history.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditHistory;
