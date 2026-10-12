import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'sonner';
import AdminDashboard from './pages/AdminDashboard';
import { SettingsProvider } from './context/SettingsContext';
import SettingsPage from './pages/SettingsPage';
import ScrollToTop from './utils/ScrollToTop';
import ITDashboard from './pages/ITDashboard';
import RuleReviewPage from './pages/RuleReviewPage';


export default function App() {

  return (
  
    <AuthProvider>
            <SettingsProvider>

      <Toaster position="top-right" expand={false} richColors closeButton visibleToasts={1}/>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
           <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rules"
            element={
              <ProtectedRoute adminOnly>
                <RuleReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
              path="/it"
              element={
                <ProtectedRoute>
                  <ITDashboard />
                </ProtectedRoute>
              } 
            />
           <Route 
              path="/settings" 
              element={
                <ProtectedRoute dropSettings>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
            </SettingsProvider>

    </AuthProvider>
  );
}
