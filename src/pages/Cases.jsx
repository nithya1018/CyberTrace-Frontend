import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useCaseList from '../hooks/useCaseList';

export default function Cases() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { cases, loading, error: casesError, refreshCases } = useCaseList(
    '/cases',
    String(user?.userId ?? 'unknown') + ':' + String(user?.role ?? 'unknown'),
  );
  const [investigators, setInvestigators] = useState([]);
  const [investigatorsLoading, setInvestigatorsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [actionError, setActionError] = useState('');
  const error = actionError || casesError;

  useEffect(() => {
    if (isAdmin) {
      setInvestigatorsLoading(true);
      api.get('/admin/investigators')
        .then((res) => setInvestigators(res.data))
        .catch(() => setActionError('Failed to load investigators'))
        .finally(() => setInvestigatorsLoading(false));
    }
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!assignedToUserId) {
      setActionError('Choose an investigator before creating the case');
      return;
    }
    try {
      await api.post('/cases', {
        title,
        description,
        assignedToUserId: Number(assignedToUserId),
      });
      setTitle('');
      setDescription('');
      setAssignedToUserId('');
      setShowForm(false);
      void refreshCases();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data?.error || 'Failed to create case');
    }
  };

  const handleAssign = async (caseId, investigatorId) => {
    if (!investigatorId) return;
    setActionError('');
    try {
      await api.patch(`/cases/${caseId}/assign`, { investigatorId: Number(investigatorId) });
      void refreshCases();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data?.error || 'Failed to assign case');
    }
  };

  const handleDelete = async (caseId) => {
    if (!window.confirm(`Delete case #${caseId}? This cannot be undone.`)) return;
    setActionError('');
    try {
      await api.delete(`/cases/${caseId}`);
      void refreshCases();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete case');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="section-header">
          <h1>Forensic Cases</h1>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Case'}
            </button>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {isAdmin && showForm && (
          <form className="inline-card" onSubmit={handleCreate}>
            <label>Case Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />

            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />

            <label>Assign Investigator</label>
            <select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)} required>
              <option value="" disabled>
                {investigatorsLoading ? 'Loading investigators…' : '-- Choose an investigator --'}
              </option>
              {investigators.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            {investigators.length === 0 && !investigatorsLoading && (
              <p className="empty-state">No active investigators are available. Add or enable an investigator first.</p>
            )}
            <button type="submit" className="btn-primary" disabled={investigatorsLoading || investigators.length === 0}>
              Create Case
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : cases.length === 0 ? (
          <p className="empty-state">No cases found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Status</th><th>Assigned To</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{c.title}</td>
                  <td>
                    <span className={`status-pill status-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        value={c.assignedTo ? c.assignedTo.id : ''}
                        onChange={(e) => handleAssign(c.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {investigators.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (
                      c.assignedTo ? c.assignedTo.name : '—'
                    )}
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/cases/${c.id}`}>View / Edit →</Link>
                    {isAdmin && (
                      <button
                        className="btn-small"
                        style={{ marginLeft: 10 }}
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
