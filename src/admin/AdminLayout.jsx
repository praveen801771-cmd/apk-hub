import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Smartphone, PlusCircle, Layers, 
  LogOut, ExternalLink, Menu, X, Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '74px' }}>
      
      {/* 1. Desktop Sidebar */}
      <aside
        className="admin-sidebar glass-panel"
        style={{
          width: '260px',
          margin: '16px 0 16px 16px',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 'var(--radius-xl)',
          position: 'sticky',
          top: '90px',
          height: 'calc(100vh - 110px)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Admin badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--badge-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Shield size={20} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>Admin Center</span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {profile?.role || 'Administrator'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/apps"
              end
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Smartphone size={18} />
              <span>All Applications</span>
            </NavLink>

            <NavLink
              to="/admin/apps/new"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <PlusCircle size={18} />
              <span>Add Application</span>
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Layers size={18} />
              <span>Categories</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass"
            style={{ fontSize: '0.85rem', padding: '8px 12px', justifyContent: 'flex-start' }}
          >
            <ExternalLink size={16} /> View Storefront
          </Link>

          <button
            onClick={handleLogout}
            className="btn-glass btn-danger"
            style={{ fontSize: '0.85rem', padding: '8px 12px', justifyContent: 'flex-start' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Content Area */}
      <main style={{ flex: 1, padding: '16px 20px 40px 20px', minWidth: 0 }}>
        {/* Mobile Sub-Header with drawer toggle */}
        <div
          className="admin-mobile-bar glass-panel"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--primary)" /> Admin Menu
          </span>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="btn-glass"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            {drawerOpen ? <X size={16} /> : <Menu size={16} />}
            <span>Menu</span>
          </button>
        </div>

        {/* Mobile Drawer */}
        {drawerOpen && (
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              marginBottom: '20px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <NavLink
              to="/admin/dashboard"
              onClick={() => setDrawerOpen(false)}
              className="admin-nav-link"
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink
              to="/admin/apps"
              end
              onClick={() => setDrawerOpen(false)}
              className="admin-nav-link"
            >
              <Smartphone size={18} /> All Applications
            </NavLink>
            <NavLink
              to="/admin/apps/new"
              onClick={() => setDrawerOpen(false)}
              className="admin-nav-link"
            >
              <PlusCircle size={18} /> Add Application
            </NavLink>
            <NavLink
              to="/admin/categories"
              onClick={() => setDrawerOpen(false)}
              className="admin-nav-link"
            >
              <Layers size={18} /> Categories
            </NavLink>
            <button
              onClick={handleLogout}
              className="btn-glass btn-danger"
              style={{ marginTop: '8px', justifyContent: 'center' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}

        <Outlet />
      </main>

      {/* Admin layout styles */}
      <style>{`
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .admin-nav-link:hover {
          color: var(--text-primary);
          background: var(--glass-bg-hover);
        }
        .admin-nav-link.active {
          color: var(--primary);
          background: var(--badge-bg);
          border: 1px solid var(--glass-border-hover);
        }
        @media (max-width: 900px) {
          .admin-sidebar {
            display: none !important;
          }
          .admin-mobile-bar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
