import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  // LOAD USERS
  const loadUsers = async () => {
    setLoading(true);

    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load users.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ENABLE / DISABLE USER
  const toggleEnabled = async (userId) => {
    setError('');
    setSuccess('');

    try {
      await api.patch(`/admin/users/${userId}/toggle-enabled`);
      setSuccess('User status updated successfully.');
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update user status.'
      );
    }
  };

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE INVESTIGATOR
  const createInvestigator = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSaving(true);

    try {
      await api.post('/admin/investigators', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'INVESTIGATOR',
      });

      setSuccess('Investigator created successfully!');

      setForm({
        name: '',
        email: '',
        password: '',
      });

      setShowForm(false);

      // Refresh users table
      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Could not create investigator. Check your details and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="page-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <h1>User Management</h1>

          <button
            className="btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setError('');
              setSuccess('');
            }}
          >
            {showForm ? 'Cancel' : '+ Add Investigator'}
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#351b20',
              color: '#ff9999',
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div
            role="status"
            style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: '#153a35',
              color: '#42d5c8',
            }}
          >
            {success}
          </div>
        )}

        {/* ADD INVESTIGATOR FORM */}
        {showForm && (
          <div
            style={{
              padding: '24px',
              marginBottom: '28px',
              border: '1px solid #293746',
              borderRadius: '12px',
              background: '#151d29',
              maxWidth: '600px',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Add New Investigator</h2>

            <form onSubmit={createInvestigator}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="investigator-name"
                  style={{ display: 'block', marginBottom: '8px' }}
                >
                  Full Name
                </label>

                <input
                  id="investigator-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter investigator name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="investigator-email"
                  style={{ display: 'block', marginBottom: '8px' }}
                >
                  Email Address
                </label>

                <input
                  id="investigator-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="investigator@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="investigator-password"
                  style={{ display: 'block', marginBottom: '8px' }}
                >
                  Temporary Password
                </label>

                <input
                  id="investigator-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  autoComplete="new-password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <p style={{ color: '#9ca9b9', fontSize: '14px' }}>
                Role: INVESTIGATOR (assigned automatically)
              </p>

              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Investigator'}
              </button>
            </form>
          </div>
        )}

        {/* USERS TABLE */}
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role?.name}</td>

                  <td>
                    <span
                      className={`status-pill ${
                        u.enabled ? 'status-open' : 'status-closed'
                      }`}
                    >
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : '-'}
                  </td>

                  <td>
                    <button
                      className="btn-small"
                      onClick={() => toggleEnabled(u.id)}
                      disabled={u.role?.name === 'ADMIN'}
                    >
                      {u.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="6">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}