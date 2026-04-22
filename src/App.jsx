import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Gallery from './pages/Gallery';
import GamePage from './pages/GamePage';
import AuthDebug from './components/AuthDebug';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/games" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/games" element={<Gallery />} />
        <Route path="/games/:slug" element={<GamePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthDebug />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
