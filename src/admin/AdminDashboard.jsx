import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, CheckCircle, FileText, Sparkles, 
  Layers, Plus, ExternalLink, ArrowRight, Eye, Edit3 
} from 'lucide-react';
import { supabase, formatBytes, getStoragePublicUrl } from '../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalApps: 0,
    publishedApps: 0,
    draftApps: 0,
    featuredApps: 0,
    totalCategories: 0,
    totalVersions: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        // 1. Fetch apps
        const { data: appsData } = await supabase
          .from('apps')
          .select(`
            *,
            categories (name),
            app_versions (*)
          `)
          .order('created_at', { ascending: false });

        const allApps = appsData || [];
        const published = allApps.filter(a => a.status === 'published').length;
        const drafts = allApps.filter(a => a.status === 'draft' || a.status === 'unpublished').length;
        const featured = allApps.filter(a => a.featured).length;

        // 2. Fetch categories count
        const { count: catCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch versions count
        const { count: versionCount } = await supabase
          .from('app_versions')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalApps: allApps.length,
          publishedApps: published,
          draftApps: drafts,
          featuredApps: featured,
          totalCategories: catCount || 0,
          totalVersions: versionCount || 0
        });

        setRecentApps(allApps.slice(0, 5));
      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Store Overview
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Real-time management metrics from your Supabase production database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/apps/new" className="btn-glass btn-primary">
            <Plus size={16} />
            <span>Add App</span>
          </Link>
          <Link to="/" target="_blank" rel="noopener noreferrer" className="btn-glass">
            <ExternalLink size={16} />
            <span>View Store</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: Total Apps */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Apps
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)' }}>
              <Smartphone size={18} color="var(--primary)" />
            </div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalApps}</span>
        </div>

        {/* Card 2: Published Apps */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Published
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)' }}>
              <CheckCircle size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{stats.publishedApps}</span>
        </div>

        {/* Card 3: Drafts / Unpublished */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Drafts / Hidden
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(148, 163, 184, 0.12)' }}>
              <FileText size={18} color="#94a3b8" />
            </div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.draftApps}</span>
        </div>

        {/* Card 4: Featured Apps */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Featured
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)' }}>
              <Sparkles size={18} color="#fbbf24" />
            </div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{stats.featuredApps}</span>
        </div>

        {/* Card 5: Categories */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Categories
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)' }}>
              <Layers size={18} color="var(--accent-purple)" />
            </div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalCategories}</span>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recently Added Applications</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Applications listed in Supabase database
            </p>
          </div>
          <Link to="/admin/apps" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Apps <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading recent apps...</div>
        ) : recentApps.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>App</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Version</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => {
                  const iconUrl = app.icon_url ? getStoragePublicUrl(app.icon_url) : null;
                  const currentVer = app.app_versions?.find(v => v.is_current) || app.app_versions?.[0];
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--glass-bg-hover)', overflow: 'hidden', flexShrink: 0 }}>
                          {iconUrl && <img src={iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{app.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.developer || 'No dev info'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{app.categories?.name || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>v{currentVer?.version || app.version || '1.0.0'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className="glass-badge"
                          style={{
                            background: app.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: app.status === 'published' ? '#34d399' : '#94a3b8'
                          }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/admin/apps/edit/${app.id}`} className="btn-glass" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                            <Edit3 size={14} /> Edit
                          </Link>
                          <Link to={`/apk/${app.slug}`} target="_blank" className="btn-glass" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                            <Eye size={14} /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No applications found in the database.
          </div>
        )}
      </div>

    </div>
  );
}
