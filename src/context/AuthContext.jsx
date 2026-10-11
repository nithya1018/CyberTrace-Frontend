import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ct_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, userId, name, email: userEmail, role } = res.data;
    const userObj = { userId, name, email: userEmail, role };
    localStorage.setItem('ct_token', token);
    localStorage.setItem('ct_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password, role: 'INVESTIGATOR' });
  };

  const logout = () => {
    localStorage.removeItem('ct_token');
    localStorage.removeItem('ct_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
