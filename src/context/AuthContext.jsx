import { createContext, useContext, useState } from 'react';
import api from '../components/services/api'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const loading = false; // Always false now since we initialize synchronously

  const login = async (email, password) => {
    // Backend API login (commented out for now)
    try {
      
      let payload = { 'email': email, 'password': password }
      const response = await api.post('api/v1/auth/login', payload);
      const { access_token, refresh_token, email: userEmail, first_name, role } = response.data;      
      localStorage.setItem('access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      
      const userData = { email: userEmail, first_name, role }; 
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      
      // const userData = { email, name: 'Girish' };
      
      // Mock tokens for local storage compatibility
      // localStorage.setItem('refresh_token', 'mock_refresh_token');
      
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }

    
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
