import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import useCaseList from '../hooks/useCaseList';

export default function Dashboard() {
  const { user } = useAuth();
  const endpoint = user.role === 'ADMIN' ? '/cases' : '/cases/my-cases';
  const { cases, loading, error } = useCaseList(
    endpoint,
    String(user?.userId ?? 'unknown') + ':' + String(user?.role ?? 'unknown'),
  );

  const counts = {
    total: cases.length,
    open: cases.filter((c) => c.status === 'OPEN').length,
    inProgress: cases.filter((c) => c.status === 'IN_PROGRESS').length,
    closed: cases.filter((c) => c.status === 'CLOSED').length,
  };

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <h1>Welcome, {user.name}</h1>
        <p className="role-badge">{user.role}</p>
        {error && <div className="alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card"><span>{counts.total}</span><p>Total Cases</p></div>
          <div className="stat-card stat-open"><span>{counts.open}</span><p>Open</p></div>
          <div className="stat-card stat-progress"><span>{counts.inProgress}</span><p>In Progress</p></div>
          <div className="stat-card stat-closed"><span>{counts.closed}</span><p>Closed</p></div>
        </div>

        <div className="section-header">
          <h2>{user.role === 'ADMIN' ? 'All Cases' : 'My Assigned Cases'}</h2>
          <Link to="/cases" className="btn-primary">View All Cases</Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : cases.length === 0 ? (
          <p className="empty-state">No cases yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {cases.slice(0, 5).map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td><span className={`status-pill status-${(c.status || '').toLowerCase()}`}>{c.status}</span></td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td><Link to={`/cases/${c.id}`}>View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
