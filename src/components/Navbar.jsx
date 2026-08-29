import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Laptop, Shield, Sparkles, Layers, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { themeMode, setThemeMode, activeTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/apps?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const cycleTheme = () => {
    if (themeMode === 'dark') setThemeMode('light');
    else if (themeMode === 'light') setThemeMode('system');
    else setThemeMode('dark');
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') return <Laptop size={18} />;
    return themeMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="top-title-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--glass-bg-heavy)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: isScrolled ? '0 8px 30px -4px rgba(0, 0, 0, 0.4)' : '0 2px 16px -2px rgba(0, 0, 0, 0.2)',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '62px',
          gap: '12px'
        }}
      >
        {/* Top Title Bar: Brand Logo & Title */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          <img
            src="/favicon.svg"
            alt="APK Hub"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px -2px var(--primary-glow)',
              flexShrink: 0
            }}
          />
          <div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                display: 'block'
              }}
              className="text-gradient"
            >
              APK Hub
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'none',
            flex: '1',
            maxWidth: '400px',
            position: 'relative',
            margin: '0 16px'
          }}
          className="search-form-desktop"
        >
          <input
            type="text"
            placeholder="Search apps, tools, games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
            style={{ paddingLeft: '38px', height: '38px', fontSize: '0.88rem', borderRadius: 'var(--radius-full)' }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
        </form>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="nav-desktop">
          <Link
            to="/apps"
            className="btn-glass"
            style={{
              height: '38px',
              padding: '0 14px',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
              borderColor: isActive('/apps') ? 'var(--primary)' : 'var(--glass-border)'
            }}
          >
            <Layers size={15} />
            <span>Explore</span>
          </Link>

          {/* Theme Switcher Button */}
          <button
            onClick={cycleTheme}
            className="btn-glass"
            title={`Current theme: ${themeMode} (click to toggle)`}
            aria-label="Toggle theme"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: 'var(--radius-full)' }}
          >
            {getThemeIcon()}
          </button>

          {/* Admin link */}
          <Link
            to={user ? '/admin/dashboard' : '/admin/login'}
            className="btn-glass"
            title={user ? (isAdmin ? 'Admin Dashboard' : 'Admin Panel') : 'Admin Login'}
            style={{
              height: '38px',
              padding: '0 14px',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
              borderColor: user && isAdmin ? 'rgba(56, 189, 248, 0.4)' : 'var(--glass-border)'
            }}
          >
            <Shield size={15} color={user && isAdmin ? '#38bdf8' : 'currentColor'} />
            <span>{user && isAdmin ? 'Dashboard' : 'Admin'}</span>
          </Link>
        </nav>

        {/* Mobile Title Bar Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="nav-mobile-toggle">
          <button
            onClick={cycleTheme}
            className="btn-glass"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-full)' }}
            aria-label="Toggle theme"
          >
            {getThemeIcon()}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-glass"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-full)' }}
            aria-label="Open search & menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Search & Menu */}
      {mobileMenuOpen && (
        <div
          className="glass-panel"
          style={{
            margin: '12px 16px 0 16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search apps, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '38px', height: '42px' }}
              autoFocus
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Link
              to="/apps"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-glass"
              style={{ justifyContent: 'center' }}
            >
              <Layers size={16} /> Explore
            </Link>
            <Link
              to={user ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="btn-glass"
              style={{ justifyContent: 'center' }}
            >
              <Shield size={16} /> {user && isAdmin ? 'Dashboard' : 'Admin'}
            </Link>
          </div>
        </div>
      )}

      {/* Style helper for responsive navbar */}
      <style>{`
        @media (min-width: 768px) {
          .search-form-desktop { display: block !important; }
          .nav-desktop { display: flex !important; }
          .nav-mobile-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </header>
  );
}
