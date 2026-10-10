import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Cases() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [cases, setCases] = useState([]);
  const [investigators, setInvestigators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [error, setError] = useState('');

  const loadCases = () => {
    setLoading(true);
    api.get('/cases')
      .then((res) => setCases(res.data))
      .catch(() => setError('Failed to load cases'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCases();
    if (isAdmin) {
      api.get('/admin/investigators')
        .then((res) => setInvestigators(res.data))
        .catch(() => setError('Failed to load investigators'));
    }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/cases', {
        title,
        description,
        assignedToUserId: assignedToUserId ? Number(assignedToUserId) : null,
      });
      setTitle('');
      setDescription('');
      setAssignedToUserId('');
      setShowForm(false);
      loadCases();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create case');
    }
  };

  const handleAssign = async (caseId, investigatorId) => {
    if (!investigatorId) return;
    setError('');
    try {
      await api.patch(`/cases/${caseId}/assign`, { investigatorId: Number(investigatorId) });
      loadCases();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to assign case');
    }
  };

  const handleDelete = async (caseId) => {
    if (!window.confirm(`Delete case #${caseId}? This cannot be undone.`)) return;
    setError('');
    try {
      await api.delete(`/cases/${caseId}`);
      loadCases();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete case');
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

            <label>Assign Investigator (optional)</label>
            <select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)}>
              <option value="">-- Unassigned --</option>
              {investigators.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <button type="submit" className="btn-primary">Create Case</button>
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