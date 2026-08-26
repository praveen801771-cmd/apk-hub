import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminAuthGuard({ children }) {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>Verifying administrative privileges...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Authenticated, but role is not admin in public.profiles
  if (!isAdmin) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: '500px' }}>
          <ShieldAlert size={48} color="#f87171" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            You are logged in as <strong>{user.email}</strong>, but your account does not have administrative privileges in <code>public.profiles</code> (role must be 'admin').
          </p>
          <button onClick={signOut} className="btn-glass btn-danger">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
