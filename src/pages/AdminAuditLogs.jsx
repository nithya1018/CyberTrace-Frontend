import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs')
      .then((res) => setLogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Audit Logs</h1>
        {loading ? (
          <p>Loading...</p>
        ) : logs.length === 0 ? (
          <p className="empty-state">
            No audit log entries yet. (The backend's AuditLogService needs to be
            called from controllers/services at key actions — see backend README.)
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Action</th><th>IP</th><th>Details</th><th>When</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.user?.name || 'System'}</td>
                  <td>{log.action}</td>
                  <td>{log.ipAddress || '—'}</td>
                  <td>{log.details || '—'}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
