import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Github, Smartphone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="glass-panel"
      style={{
        marginTop: 'auto',
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        padding: '40px 0 24px 0',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <img
                src="/favicon.svg"
                alt="APK Hub"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  boxShadow: '0 4px 12px -2px var(--primary-glow)'
                }}
              />
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }} className="text-gradient">
                APK Hub
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px' }}>
              Discover and download Android APK packages.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>
                <Link to="/" style={{ transition: 'color var(--transition-fast)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/apps" style={{ transition: 'color var(--transition-fast)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  All Applications
                </Link>
              </li>
              <li>
                <Link to="/apps?featured=true" style={{ transition: 'color var(--transition-fast)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  Featured Apps
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Management */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Admin & System
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>
                <Link to="/admin/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', transition: 'color var(--transition-fast)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                  <Shield size={14} /> Admin Portal
                </Link>
              </li>
              <li>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <Smartphone size={14} /> PWA Ready
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            paddingTop: '20px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            APK Hub • {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}
