import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download, Sparkles, Box } from 'lucide-react';
import { formatBytes, getStoragePublicUrl } from '../lib/supabase';

export default function AppCard({ app, currentVersion }) {
  const versionInfo = currentVersion || app.app_versions?.find(v => v.is_current) || app.app_versions?.[0] || {};
  const iconUrl = app.icon_url ? getStoragePublicUrl(app.icon_url) : null;
  const categoryName = app.categories?.name || app.category_name || 'App';
  const apkSize = versionInfo.apk_size ? formatBytes(versionInfo.apk_size) : (app.apk_size ? formatBytes(app.apk_size) : null);
  const versionString = versionInfo.version || app.version || '1.0.0';
  const downloadUrl = versionInfo.apk_url || app.apk_url;

  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        height: '100%'
      }}
    >
      <div>
        {/* Header with Icon and Badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'var(--glass-bg-hover)',
                border: '1px solid var(--glass-border-highlight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 6px 16px -4px rgba(0,0,0,0.2)'
              }}
            >
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={`${app.name} icon`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Box size={28} color="var(--primary)" />
              )}
            </div>

            <div>
              <Link to={`/apk/${app.slug}`}>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                >
                  {app.name}
                </h3>
              </Link>
              {app.developer && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {app.developer}
                </span>
              )}
            </div>
          </div>

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

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {app.short_description || app.description || 'Verified Android Application package.'}
        </p>
      </div>

      {/* Metadata Pill & Action Buttons */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--glass-bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '16px',
            border: '1px solid var(--glass-border)'
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {categoryName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>v{versionString}</span>
            {apkSize && (
              <>
                <span style={{ opacity: 0.4 }}>•</span>
                <span>{apkSize}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Link
            to={`/apk/${app.slug}`}
            className="btn-glass"
            style={{ fontSize: '0.88rem', padding: '8px 14px' }}
          >
            <Eye size={16} />
            <span>Details</span>
          </Link>

          {downloadUrl ? (
            <a
              href={getStoragePublicUrl(downloadUrl)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass btn-primary"
              style={{ fontSize: '0.88rem', padding: '8px 14px' }}
            >
              <Download size={16} />
              <span>Get APK</span>
            </a>
          ) : (
            <Link
              to={`/apk/${app.slug}`}
              className="btn-glass btn-primary"
              style={{ fontSize: '0.88rem', padding: '8px 14px' }}
            >
              <Download size={16} />
              <span>Get APK</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
