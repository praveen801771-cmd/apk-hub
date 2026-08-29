import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Search, Layers, ArrowRight, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AppCard from '../components/AppCard';
import { AppGridSkeleton } from '../components/SkeletonLoader';

export default function HomePage() {
  const [featuredApps, setFeaturedApps] = useState([]);
  const [latestApps, setLatestApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        setCategories(catData || []);

        // 2. Fetch featured apps with versions
        const { data: featuredData } = await supabase
          .from('apps')
          .select(`
            *,
            categories (id, name, slug),
            app_versions (*)
          `)
          .eq('featured', true)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6);
        setFeaturedApps(featuredData || []);

        // 3. Fetch latest published apps with versions
        const { data: latestData } = await supabase
          .from('apps')
          .select(`
            *,
            categories (id, name, slug),
            app_versions (*)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(12);
        setLatestApps(latestData || []);

      } catch (err) {
        console.error('Error loading homepage data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/apps?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="main-content">
      {/* 1. Hero Section */}
      <section className="container hero-section-container" style={{ marginBottom: '48px', paddingTop: '12px' }}>
        <div
          className="glass-panel hero-glass-panel"
          style={{
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          {/* Ambient inner glow */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '300px',
              background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '720px', margin: '0 auto' }}>
            <span
              className="glass-badge"
              style={{
                marginBottom: '16px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                gap: '6px'
              }}
            >
              <Sparkles size={13} color="var(--primary)" /> Verified Android Packages
            </span>

            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '14px'
              }}
            >
              Discover <span className="text-gradient">Amazing Apps</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.92rem, 2vw, 1.12rem)',
                color: 'var(--text-secondary)',
                marginBottom: '26px',
                lineHeight: 1.6
              }}
            >
              Find useful apps, tools, and games in one seamless Liquid Glass marketplace.
              Direct, secure APK downloads with zero bloat.
            </p>

            {/* Hero Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="hero-search-form"
              style={{
                display: 'flex',
                gap: '8px',
                maxWidth: '540px',
                margin: '0 auto 24px auto',
                position: 'relative'
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <input
                  type="text"
                  placeholder="Search apps, tools, games..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="glass-input"
                  style={{
                    height: '48px',
                    paddingLeft: '42px',
                    fontSize: '0.95rem',
                    borderRadius: 'var(--radius-lg)'
                  }}
                />
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-glass btn-primary"
                style={{
                  height: '48px',
                  padding: '0 20px',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.95rem',
                  flexShrink: 0
                }}
              >
                Search
              </button>
            </form>

            {/* Feature Highlights */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="var(--accent-emerald)" /> Direct APK Storage
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={15} color="var(--primary)" /> Zero Fake Counters
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={15} color="var(--accent-purple)" /> PWA Installable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Horizontal Bar */}
      {categories.length > 0 && (
        <section className="container" style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--primary)" /> Browse Categories
            </h2>
            <Link to="/apps" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              All Apps <ArrowRight size={14} />
            </Link>
          </div>

          <div className="category-scroll-container">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="category-chip"
              >
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Featured Apps Section */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#fbbf24" /> Featured Applications
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Editorially selected Android applications
            </p>
          </div>

          <Link to="/apps?featured=true" className="btn-glass" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
            View All
          </Link>
        </div>

        {loading ? (
          <AppGridSkeleton count={3} />
        ) : featuredApps.length > 0 ? (
          <div className="grid-apps">
            {featuredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No featured apps available at the moment.
          </div>
        )}
      </section>

      {/* 4. Latest Applications Grid */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Latest Applications
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Recently published packages on APK Store
            </p>
          </div>

          <Link to="/apps" className="btn-glass btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            Explore Full Catalog <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <AppGridSkeleton count={6} />
        ) : latestApps.length > 0 ? (
          <div className="grid-apps">
            {latestApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No published applications found. Check back soon!
          </div>
        )}
      </section>
    </div>
  );
}
