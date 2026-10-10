import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [forensicCase, setCase] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [notes, setNotes] = useState([]);
  const [findings, setFindings] = useState([]);
  const [investigators, setInvestigators] = useState([]);
  const [activeTab, setActiveTab] = useState('evidence');
  const [error, setError] = useState('');

  // edit-case form state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssigned, setEditAssigned] = useState('');

  const loadAll = async () => {
    try {
      const [caseRes, evRes, notesRes, findRes] = await Promise.all([
        api.get(`/cases/${id}`),
        api.get(`/evidence/case/${id}`),
        api.get(`/investigation/case/${id}/notes`),
        api.get(`/investigation/case/${id}/findings`),
      ]);
      setCase(caseRes.data);
      setEvidence(evRes.data);
      setNotes(notesRes.data);
      setFindings(findRes.data);
    } catch {
      setError('Failed to load case details');
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/investigators')
        .then((res) => setInvestigators(res.data))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/cases/${id}/status`, { status: newStatus });
      setCase(res.data);
    } catch {
      setError('Failed to update status');
    }
  };

  const startEdit = () => {
    setEditTitle(forensicCase.title);
    setEditDescription(forensicCase.description || '');
    setEditAssigned(forensicCase.assignedTo ? forensicCase.assignedTo.id : '');
    setEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.put(`/cases/${id}`, {
        title: editTitle,
        description: editDescription,
        status: forensicCase.status,
        assignedToUserId: editAssigned ? Number(editAssigned) : null,
      });
      setCase(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update case');
    }
  };

  const handleDeleteCase = async () => {
    if (!window.confirm(`Delete case #${id}? This cannot be undone.`)) return;
    try {
      await api.delete(`/cases/${id}`);
      navigate('/cases');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete case');
    }
  };

  if (!forensicCase) return (
    <div><Navbar /><div className="page-container"><p>Loading case...</p></div></div>
  );

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="case-header">
          <div>
            <h1>#{forensicCase.id} — {forensicCase.title}</h1>
            <p className="case-description">{forensicCase.description}</p>
            <p className="meta">
              Assigned to: {forensicCase.assignedTo ? forensicCase.assignedTo.name : 'Unassigned'}
            </p>
          </div>
          <div className="status-selector">
            <label>Status:</label>
            <select value={forensicCase.status} onChange={(e) => handleStatusChange(e.target.value)}>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <div style={{ marginTop: 8 }}>
              <button className="btn-small" onClick={startEdit}>Edit</button>
              {isAdmin && (
                <button className="btn-small" style={{ marginLeft: 6 }} onClick={handleDeleteCase}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {editing && (
          <form className="inline-card" onSubmit={handleSaveEdit}>
            <label>Case Title</label>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />

            <label>Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />

            {isAdmin && (
              <>
                <label>Assigned Investigator</label>
                <select value={editAssigned} onChange={(e) => setEditAssigned(e.target.value)}>
                  <option value="">-- Unassigned --</option>
                  {investigators.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </>
            )}

            <div>
              <button type="submit" className="btn-primary">Save Changes</button>
              <button type="button" className="btn-small" style={{ marginLeft: 8 }} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="tabs">
          <button className={activeTab === 'evidence' ? 'tab-active' : ''} onClick={() => setActiveTab('evidence')}>
            Evidence ({evidence.length})
          </button>
          <button className={activeTab === 'notes' ? 'tab-active' : ''} onClick={() => setActiveTab('notes')}>
            Investigation Notes ({notes.length})
          </button>
          <button className={activeTab === 'findings' ? 'tab-active' : ''} onClick={() => setActiveTab('findings')}>
            Findings ({findings.length})
          </button>
        </div>

        {activeTab === 'evidence' && (
          <EvidenceTab caseId={id} evidence={evidence} onChange={loadAll} />
        )}
        {activeTab === 'notes' && (
          <NotesTab caseId={id} notes={notes} onChange={loadAll} />
        )}
        {activeTab === 'findings' && (
          <FindingsTab caseId={id} findings={findings} onChange={loadAll} />
        )}
      </div>
    </div>
  );
}

// ===== EVIDENCE TAB (with chain-of-custody drill-in) =====
function EvidenceTab({ caseId, evidence, onChange }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [custody, setCustody] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    try {
      await api.post(`/evidence/case/${caseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setDescription('');
      onChange();
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleCustody = async (evidenceId) => {
    if (expandedId === evidenceId) {
      setExpandedId(null);
      return;
    }
    const res = await api.get(`/chain-of-custody/evidence/${evidenceId}`);
    setCustody(res.data);
    setExpandedId(evidenceId);
  };

  const addCustodyRecord = async (evidenceId) => {
    const action = prompt('Action (e.g. Collected, Transferred, Analyzed, Stored):');
    if (!action) return;
    const location = prompt('Location:') || '';
    const notes = prompt('Notes:') || '';
    await api.post(`/chain-of-custody/evidence/${evidenceId}`, { action, location, notes });
    const res = await api.get(`/chain-of-custody/evidence/${evidenceId}`);
    setCustody(res.data);
  };

  return (
    <div>
      <form className="inline-card" onSubmit={handleUpload}>
        <label>Upload Evidence File</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <label>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" className="btn-primary" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {evidence.length === 0 ? (
        <p className="empty-state">No evidence uploaded yet.</p>
      ) : (
        <div className="evidence-list">
          {evidence.map((ev) => (
            <div key={ev.id} className="evidence-card">
              <div className="evidence-card-header" onClick={() => toggleCustody(ev.id)}>
                <strong>{ev.fileName}</strong>
                <span className="hash-tag">SHA-256: {ev.hash?.substring(0, 16)}...</span>
              </div>
              <p>{ev.description}</p>
              <p className="meta">Uploaded by {ev.uploadedBy?.name} on {new Date(ev.uploadedAt).toLocaleString()}</p>

              {expandedId === ev.id && (
                <div className="custody-panel">
                  <div className="section-header">
                    <h4>Chain of Custody</h4>
                    <button className="btn-small" onClick={() => addCustodyRecord(ev.id)}>+ Add Record</button>
                  </div>
                  {custody.length === 0 ? (
                    <p className="empty-state">No custody records yet.</p>
                  ) : (
                    <ul className="custody-timeline">
                      {custody.map((c) => (
                        <li key={c.id}>
                          <strong>{c.action}</strong> — {c.location || 'No location'}
                          <br />
                          <span className="meta">
                            by {c.handledBy?.name} on {new Date(c.timestamp).toLocaleString()}
                          </span>
                          {c.notes && <p className="custody-notes">{c.notes}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== NOTES TAB =====
function NotesTab({ caseId, notes, onChange }) {
  const [note, setNote] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await api.post(`/investigation/case/${caseId}/notes`, { note });
    setNote('');
    onChange();
  };

  return (
    <div>
      <form className="inline-card" onSubmit={handleAdd}>
        <label>Add Investigation Note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} required />
        <button type="submit" className="btn-primary">Add Note</button>
      </form>

      {notes.length === 0 ? (
        <p className="empty-state">No notes yet.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((n) => (
            <li key={n.id}>
              <p>{n.note}</p>
              <span className="meta">— {n.createdBy?.name}, {new Date(n.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===== FINDINGS TAB =====
function FindingsTab({ caseId, findings, onChange }) {
  const [summary, setSummary] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!summary.trim()) return;
    await api.post(`/investigation/case/${caseId}/findings`, { summary, recommendation });
    setSummary('');
    setRecommendation('');
    onChange();
  };

  return (
    <div>
      <form className="inline-card" onSubmit={handleAdd}>
        <label>Finding Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} required />
        <label>Recommendation</label>
        <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows={2} />
        <button type="submit" className="btn-primary">Add Finding</button>
      </form>

      {findings.length === 0 ? (
        <p className="empty-state">No findings recorded yet.</p>
      ) : (
        <ul className="notes-list">
          {findings.map((f) => (
            <li key={f.id}>
              <p><strong>Summary:</strong> {f.summary}</p>
              {f.recommendation && <p><strong>Recommendation:</strong> {f.recommendation}</p>}
              <span className="meta">— {f.createdBy?.name}, {new Date(f.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}