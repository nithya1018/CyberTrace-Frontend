import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">🛡️ CyberTrace</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/cases">Cases</Link>
        {user?.role === 'ADMIN' && (
          <>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/audit-logs">Audit Logs</Link>
          </>
        )}
        {user && (
          <span className="navbar-user">
            {user.name} ({user.role})
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </span>
        )}
      </div>
    </nav>
  );
}
