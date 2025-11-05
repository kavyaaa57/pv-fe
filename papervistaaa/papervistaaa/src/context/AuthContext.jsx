import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('pv_auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (_) {
        localStorage.removeItem('pv_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email }) => {
    const fakeUser = { id: 'demo', name: email.split('@')[0], email };
    localStorage.setItem('pv_auth', JSON.stringify(fakeUser));
    setUser(fakeUser);
    return fakeUser;
  };

  const logout = () => {
    localStorage.removeItem('pv_auth');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


