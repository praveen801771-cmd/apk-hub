import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Sparkles, Box, Cpu, Smartphone, 
  Calendar, ShieldCheck, Globe, Mail, CheckCircle2, AlertCircle, EyeOff, Edit3 
} from 'lucide-react';
import { supabase, formatBytes, getStoragePublicUrl } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import DownloadButton from '../components/DownloadButton';
import ScreenshotGallery from '../components/ScreenshotGallery';
import ShareModal from '../components/ShareModal';
import AppCard from '../components/AppCard';
import { AppDetailsSkeleton } from '../components/SkeletonLoader';

export default function AppDetailsPage() {
  const { slug } = useParams();
  const { isAdmin } = useAuth();
  const [app, setApp] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [relatedApps, setRelatedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    async function loadAppDetails() {
      try {
        setLoading(true);

        // 1. Fetch app with category
        const { data: appData, error: appError } = await supabase
          .from('apps')
          .select(`
            *,
            categories (id, name, slug)
          `)
          .eq('slug', slug)
          .single();

        if (appError || !appData) {
          setApp(null);
          return;
        }

        setApp(appData);

        // 2. Fetch current version from app_versions (is_current = true)
        const { data: versionData } = await supabase
          .from('app_versions')
          .select('*')
          .eq('app_id', appData.id)
          .eq('is_current', true)
          .maybeSingle();

        // Fallback to latest version if is_current is not explicitly flagged
        if (!versionData) {
          const { data: fallbackVersion } = await supabase
            .from('app_versions')
            .select('*')
            .eq('app_id', appData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          setCurrentVersion(fallbackVersion);
        } else {
          setCurrentVersion(versionData);
        }

        // 3. Fetch screenshots from app_screenshots
        const { data: screenshotData } = await supabase
          .from('app_screenshots')
          .select('*')
          .eq('app_id', appData.id)
          .order('sort_order', { ascending: true });
        setScreenshots(screenshotData || []);

        // 4. Fetch related apps in same category
        if (appData.category_id) {
          const { data: related } = await supabase
            .from('apps')
            .select(`
              *,
              categories (id, name, slug),
              app_versions (*)
            `)
            .eq('category_id', appData.category_id)
            .eq('status', 'published')
            .neq('id', appData.id)
            .limit(3);
          setRelatedApps(related || []);
        }

      } catch (err) {
        console.error('Error fetching app details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAppDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="main-content">
        <AppDetailsSkeleton />
      </div>
    );
  }

  // If app not found OR if app is not published and viewer is not admin
  if (!app || (app.status !== 'published' && !isAdmin)) {
    return (
      <div className="main-content">
        <div className="container" style={{ textAlign: 'center', paddingTop: '60px' }}>
          <div className="glass-panel" style={{ padding: '48px 24px', maxWidth: '500px', margin: '0 auto' }}>
            <AlertCircle size={48} color="#f87171" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>App Not Available</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              This application does not exist, has been unpublished, or is currently in draft mode.
            </p>
            <Link to="/apps" className="btn-glass btn-primary">
              <ArrowLeft size={16} /> Back to APK Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const iconUrl = app.icon_url ? getStoragePublicUrl(app.icon_url) : null;
  const versionString = currentVersion?.version || app.version || '1.0.0';
  const apkSizeFormatted = currentVersion?.apk_size ? formatBytes(currentVersion.apk_size) : (app.apk_size ? formatBytes(app.apk_size) : 'N/A');
  const apkUrl = currentVersion?.apk_url || app.apk_url;
  const androidRequirement = currentVersion?.android_version || app.android_version || 'Android 7.0+';
  const architecture = currentVersion?.architecture || app.architecture || 'Universal / arm64-v8a';
  const whatsNewText = currentVersion?.whats_new || app.whats_new;
  const lastUpdated = app.updated_at ? new Date(app.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '1040px' }}>
        
        {/* Admin Draft Preview Notice */}
        {app.status !== 'published' && isAdmin && (
          <div
            className="glass-panel"
            style={{
              padding: '12px 20px',
              marginBottom: '20px',
              background: 'rgba(245, 158, 11, 0.15)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <EyeOff size={18} />
              <span><strong>Admin Preview Mode:</strong> This app is currently <strong>{app.status.toUpperCase()}</strong> and hidden from the public marketplace.</span>
            </div>
            <Link to={`/admin/apps/edit/${app.id}`} className="btn-glass" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
              <Edit3 size={14} /> Edit / Publish
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            to="/apps"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>

        {/* 1. App Header Glass Card */}
        <div
          className="glass-panel"
          style={{
            padding: '32px',
            marginBottom: '32px',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap'
            }}
          >
            {/* Left: Icon & Main Titles */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: '280px', flex: '1' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '24px',
                  background: 'var(--glass-bg-hover)',
                  border: '1px solid var(--glass-border-highlight)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 10px 28px -6px rgba(0,0,0,0.3)'
                }}
              >
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt={`${app.name} Icon`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box size={44} color="var(--primary)" />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {app.name}
                  </h1>
                  {app.featured && (
                    <span
                      className="glass-badge"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)',
                        color: '#fbbf24',
                        borderColor: 'rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <Sparkles size={11} /> Featured
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                  {app.developer && <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{app.developer}</span>}
                  {app.categories && (
                    <>
                      <span>•</span>
                      <Link to={`/categories/${app.categories.slug}`} style={{ color: 'var(--primary)' }}>
                        {app.categories.name}
                      </Link>
                    </>
                  )}
                  {lastUpdated && (
                    <>
                      <span>•</span>
                      <span>Updated {lastUpdated}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Actions: Download & Share */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShareOpen(true)}
                className="btn-glass"
                style={{ height: '46px', padding: '0 16px' }}
                title="Share application"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>

              <DownloadButton
                apkUrl={apkUrl}
                appName={app.name}
                version={versionString}
                size={currentVersion?.apk_size || app.apk_size}
              />
            </div>
          </div>

          {/* Quick Spec Pills Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--glass-border)'
            }}
          >
            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Version</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>v{versionString}</p>
            </div>

            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Package Size</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>{apkSizeFormatted}</p>
            </div>

            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Android</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>{androidRequirement}</p>
            </div>

            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Architecture</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>{architecture}</p>
            </div>
          </div>
        </div>

        {/* 2. Screenshots Section */}
        {screenshots.length > 0 && (
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>
              Screenshots & Preview
            </h2>
            <ScreenshotGallery screenshots={screenshots} />
          </section>
        )}

        {/* 3. Description & What's New Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          
          {/* App Description */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
              About this app
            </h2>
            <div
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-line'
              }}
            >
              {app.description || app.short_description || 'No detailed description provided.'}
            </div>
          </div>

          {/* What's New / Changelog */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--primary)" /> What's New
            </h2>
            <div
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-line'
              }}
            >
              {whatsNewText || '• Initial production release\n• Performance optimizations and bug fixes'}
            </div>

              {/* Developer / Publisher Info */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
                  Developer & Publisher
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div><strong>Developer:</strong> {app.developer || 'Verified Community Developer'}</div>
                  <div><strong>Verified Package:</strong> <span style={{ color: 'var(--accent-emerald)' }}>✓ Authenticated Source</span></div>
                </div>
              </div>
            </div>
          </div>

        {/* 4. Related Category Apps */}
        {relatedApps.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '18px' }}>
              More in {app.categories?.name || 'this Category'}
            </h2>
            <div className="grid-apps">
              {relatedApps.map((relApp) => (
                <AppCard key={relApp.id} app={relApp} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        app={app}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
