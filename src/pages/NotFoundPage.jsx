import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '540px' }}>
        <div className="glass-panel" style={{ padding: '56px 32px', borderRadius: 'var(--radius-xl)' }}>
          <span
            className="text-gradient"
            style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, display: 'block', marginBottom: '12px' }}
          >
            404
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px' }}>
            Page Not Found
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
            The page or application you're looking for doesn't exist, was moved, or is temporarily unavailable.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/" className="btn-glass btn-primary" style={{ padding: '0 20px', height: '44px' }}>
              <Home size={18} /> Home
            </Link>
            <Link to="/apps" className="btn-glass" style={{ padding: '0 20px', height: '44px' }}>
              <ArrowLeft size={18} /> Browse Apps
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
