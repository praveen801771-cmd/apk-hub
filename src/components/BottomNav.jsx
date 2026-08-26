import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Layers, Search, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Hide bottom nav on full admin view if desired, or keep accessible
  return (
    <div
      className="bottom-nav-container"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 45,
        width: 'calc(100% - 32px)',
        maxWidth: '400px'
      }}
    >
      <nav
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 12px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--glass-border)'
        }}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Home size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/apps"
          className={({ isActive }) =>
            `bottom-nav-item ${isActive && !location.search.includes('q=') ? 'active' : ''}`
          }
        >
          <Layers size={20} />
          <span>Apps</span>
        </NavLink>

        <NavLink
          to="/apps?focus=search"
          className={() =>
            `bottom-nav-item ${location.pathname === '/apps' && location.search.includes('q=') ? 'active' : ''}`
          }
        >
          <Search size={20} />
          <span>Search</span>
        </NavLink>

        <NavLink
          to={user && isAdmin ? '/admin/dashboard' : '/admin/login'}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive || location.pathname.startsWith('/admin') ? 'active' : ''}`
          }
        >
          <Shield size={20} />
          <span>{user && isAdmin ? 'Admin' : 'Login'}</span>
        </NavLink>
      </nav>

      <style>{`
        .bottom-nav-container {
          display: block;
        }
        @media (min-width: 768px) {
          .bottom-nav-container {
            display: none !important;
          }
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border-radius: 12px;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .bottom-nav-item:hover {
          color: var(--text-primary);
        }
        .bottom-nav-item.active {
          color: var(--primary);
          background: var(--badge-bg);
        }
      `}</style>
    </div>
  );
}
