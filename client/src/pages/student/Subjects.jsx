import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentSubjectService } from '../../services/api';
import SubjectTable from '../../components/SubjectTable';

const Subjects = () => {
  const { student } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!student?._id) return;
      try {
        setLoading(true);
        const res = await studentSubjectService.getByStudentId(student._id);
        if (res.data.success) {
          setRecords(res.data.data);
        }
      } catch (err) {
        setError('Failed to load your assigned subjects. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [student]);

  const totalAssignedCredits = records.reduce((sum, r) => sum + (r.subjectId?.credits || 0), 0);
  const totalEarnedCredits = records
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + (r.subjectId?.credits || 0), 0);

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Enrolled Subjects</h3>
          <p className="text-secondary small mb-0">
            Comprehensive curriculum catalog for {student?.course} ({student?.academicYear})
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="d-flex flex-wrap gap-2">
          <div className="bg-white border rounded-pill px-3 py-1 shadow-sm small">
            <span className="text-secondary">Assigned: </span>
            <strong className="text-dark">{records.length} Subjects ({totalAssignedCredits} Cr)</strong>
          </div>
          <div className="bg-success-subtle border border-success-subtle rounded-pill px-3 py-1 shadow-sm small">
            <span className="text-success-emphasis">Completed: </span>
            <strong className="text-success">{totalEarnedCredits} Credits Earned</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 small mb-4" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-secondary small">Loading assigned curriculum...</p>
        </div>
      ) : (
        <SubjectTable records={records} isAdmin={false} showFilters={true} />
      )}
    </div>
  );
};

export default Subjects;
