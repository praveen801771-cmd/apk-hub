import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AppCard from '../components/AppCard';
import { AppGridSkeleton } from '../components/SkeletonLoader';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setLoading(true);

        // Fetch category by slug
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .single();

        if (catError || !catData) {
          setCategory(null);
          setApps([]);
          return;
        }

        setCategory(catData);

        // Fetch published apps under this category
        const { data: appData } = await supabase
          .from('apps')
          .select(`
            *,
            categories (id, name, slug),
            app_versions (*)
          `)
          .eq('category_id', catData.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        setApps(appData || []);
      } catch (err) {
        console.error('Error loading category page:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryData();
  }, [slug]);

  if (!loading && !category) {
    return (
      <div className="main-content">
        <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <div className="glass-panel" style={{ padding: '48px 24px', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Category Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              The category you requested does not exist or has been removed.
            </p>
            <Link to="/apps" className="btn-glass btn-primary">
              <ArrowLeft size={16} /> Browse All Apps
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        
        {/* Category Header Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '36px 32px',
            marginBottom: '36px',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <Link
              to="/apps"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: 'var(--primary)',
                marginBottom: '12px',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={14} /> Back to All Apps
            </Link>
            
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Layers size={30} color="var(--primary)" />
              <span>{category?.name || 'Category'}</span>
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {apps.length} published {apps.length === 1 ? 'application' : 'applications'} in this category
            </p>
          </div>

          <Link to={`/apps?category=${slug}`} className="btn-glass">
            Filter in Catalog
          </Link>
        </div>

        {/* Apps Grid */}
        {loading ? (
          <AppGridSkeleton count={4} />
        ) : apps.length > 0 ? (
          <div className="grid-apps">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <p style={{ fontSize: '1rem', marginBottom: '16px' }}>
              No applications are currently published under <strong>{category?.name}</strong>.
            </p>
            <Link to="/apps" className="btn-glass btn-primary">
              Discover Other Apps
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
