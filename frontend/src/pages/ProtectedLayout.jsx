import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getToken } from '../authFetch';

export default function ProtectedLayout() {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Dev@Deakin Codex · Built with ❤️ for Deakin University</p>
      </footer>
    </div>
  );
}
