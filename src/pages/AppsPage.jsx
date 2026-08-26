import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, X, Layers, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AppCard from '../components/AppCard';
import { AppGridSkeleton } from '../components/SkeletonLoader';

export default function AppsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialFeatured = searchParams.get('featured') === 'true';

  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [featuredOnly, setFeaturedOnly] = useState(initialFeatured);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'name'

  // Fetch categories once
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
    }
    fetchCategories();
  }, []);

  // Fetch apps based on filters
  useEffect(() => {
    async function fetchApps() {
      try {
        setLoading(true);
        let query = supabase
          .from('apps')
          .select(`
            *,
            categories (id, name, slug),
            app_versions (*)
          `)
          .eq('status', 'published');

        if (featuredOnly) {
          query = query.eq('featured', true);
        }

        if (selectedCategory) {
          // Find category id by slug or match category_id
          const cat = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
          if (cat) {
            query = query.eq('category_id', cat.id);
          }
        }

        if (searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%,developer.ilike.%${searchQuery.trim()}%`);
        }

        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'name') {
          query = query.order('name', { ascending: true });
        }

        const { data, error } = await query;
        if (!error && data) {
          setApps(data);
        } else {
          setApps([]);
        }
      } catch (err) {
        console.error('Error fetching apps:', err);
        setApps([]);
      } finally {
        setLoading(false);
      }
    }

    fetchApps();
  }, [searchQuery, selectedCategory, featuredOnly, sortBy, categories]);

  // Sync state to URL params
  const updateUrlParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    updateUrlParam('q', val);
  };

  const handleCategorySelect = (catSlug) => {
    const nextVal = selectedCategory === catSlug ? '' : catSlug;
    setSelectedCategory(nextVal);
    updateUrlParam('category', nextVal);
  };

  const handleFeaturedToggle = () => {
    const nextVal = !featuredOnly;
    setFeaturedOnly(nextVal);
    updateUrlParam('featured', nextVal ? 'true' : '');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setFeaturedOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory || featuredOnly;

  return (
    <div className="main-content">
      <div className="container">
        
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Explore <span className="text-gradient">Applications</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Browse, search, and download verified Android APKs.
          </p>
        </div>

        {/* Filter & Search Bar Panel */}
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            marginBottom: '32px',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {/* Top row: Search input + Sort dropdown */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search apps, developers, keywords..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '42px', height: '44px' }}
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
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleFeaturedToggle}
                className={`btn-glass ${featuredOnly ? 'btn-primary' : ''}`}
                style={{ height: '44px', padding: '0 14px', fontSize: '0.85rem' }}
              >
                <Sparkles size={16} />
                <span>Featured</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="glass-input"
                  style={{ width: 'auto', height: '44px', padding: '0 12px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingTop: '8px',
              borderTop: '1px solid var(--glass-border)',
              scrollbarWidth: 'none'
            }}
          >
            <button
              onClick={() => handleCategorySelect('')}
              className={`btn-glass ${!selectedCategory ? 'btn-primary' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`btn-glass ${isSelected ? 'btn-primary' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
                >
                  {cat.name}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-glass btn-danger"
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', marginLeft: 'auto' }}
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{apps.length}</strong> {apps.length === 1 ? 'application' : 'applications'}
          </span>
        </div>

        {/* Apps Grid */}
        {loading ? (
          <AppGridSkeleton count={6} />
        ) : apps.length > 0 ? (
          <div className="grid-apps">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div
            className="glass-panel"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Search size={28} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                No Apps Found
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
                We couldn't find any applications matching your current filter criteria.
              </p>
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn-glass btn-primary" style={{ marginTop: '8px' }}>
                Reset All Filters
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
