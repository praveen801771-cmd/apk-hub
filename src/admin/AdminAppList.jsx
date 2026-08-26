import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Edit3, Trash2, Eye, Sparkles, 
  CheckCircle, AlertCircle, X, Loader2, ArrowUpDown,
  UploadCloud, Globe, EyeOff, Check, AlertTriangle
} from 'lucide-react';
import { supabase, formatBytes, getStoragePublicUrl } from '../lib/supabase';

export default function AdminAppList() {
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModalApp, setDeleteModalApp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadApps = async () => {
    try {
      setLoading(true);

      const [appsRes, catRes] = await Promise.all([
        supabase
          .from('apps')
          .select(`
            *,
            categories (id, name),
            app_versions (*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (appsRes.error) {
        setErrorMessage(`Failed to fetch apps from Supabase: ${appsRes.error.message}`);
      } else {
        setApps(appsRes.data || []);
      }

      if (catRes.error) {
        console.error('Error fetching categories:', catRes.error);
      } else {
        setCategories(catRes.data || []);
      }
    } catch (err) {
      console.error('Error loading apps in admin:', err);
      setErrorMessage(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  // Validation function before publishing
  const validateAppForPublishing = (app) => {
    const missing = [];
    if (!app.name || !app.name.trim()) missing.push('App Name');
    if (!app.slug || !app.slug.trim()) missing.push('URL Slug');
    if (!app.category_id) missing.push('Category');
    if (!app.icon_url || !app.icon_url.trim()) missing.push('App Icon');

    const versions = app.app_versions || [];
    const hasValidApk = versions.some(v => v.apk_url && v.apk_url.trim().length > 0) || (app.apk_url && app.apk_url.trim().length > 0);
    
    if (!hasValidApk) {
      missing.push('APK package (no APK binary found in versions)');
    }

    return missing;
  };

  // Publish / Unpublish Toggle Action
  const handleTogglePublish = async (app) => {
    setErrorMessage('');
    setActionSuccess('');
    setUpdatingAppId(app.id);

    const isCurrentlyPublished = app.status === 'published';
    const targetStatus = isCurrentlyPublished ? 'unpublished' : 'published';

    // If publishing, validate required fields first
    if (targetStatus === 'published') {
      const missingFields = validateAppForPublishing(app);
      if (missingFields.length > 0) {
        setErrorMessage(
          `Cannot publish "${app.name}": Missing required information: [${missingFields.join(', ')}]. Please edit the application and provide these fields before publishing.`
        );
        setUpdatingAppId(null);
        return;
      }
    }

    try {
      // Execute the update query in Supabase
      const { data, error } = await supabase
        .from('apps')
        .update({ 
          status: targetStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', app.id)
        .select();

      if (error) {
        console.error('Supabase update status error:', error);
        setErrorMessage(`Supabase Error (${error.code || 'Update Failed'}): ${error.message} ${error.details ? `— ${error.details}` : ''}`);
      } else {
        setActionSuccess(
          targetStatus === 'published'
            ? `Application "${app.name}" has been PUBLISHED! It is now live on the public marketplace.`
            : `Application "${app.name}" has been UNPUBLISHED and hidden from the public marketplace.`
        );
        // Refresh apps list immediately
        await loadApps();
        setTimeout(() => setActionSuccess(''), 5000);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      setErrorMessage(`Failed to update application status: ${err.message}`);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleToggleFeatured = async (app) => {
    setErrorMessage('');
    const nextFeatured = !app.featured;
    try {
      const { error } = await supabase
        .from('apps')
        .update({ featured: nextFeatured, updated_at: new Date().toISOString() })
        .eq('id', app.id)
        .select();

      if (error) {
        setErrorMessage(`Supabase error updating featured status: ${error.message}`);
      } else {
        setApps(apps.map(a => a.id === app.id ? { ...a, featured: nextFeatured } : a));
        setActionSuccess(`Updated featured status for "${app.name}"`);
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      setErrorMessage(`Error: ${err.message}`);
    }
  };

  const confirmDeleteApp = async () => {
    if (!deleteModalApp) return;
    try {
      setIsDeleting(true);
      setErrorMessage('');

      // 1. Delete associated screenshots & versions
      await supabase.from('app_screenshots').delete().eq('app_id', deleteModalApp.id);
      await supabase.from('app_versions').delete().eq('app_id', deleteModalApp.id);

      // 2. Delete the app record
      const { error } = await supabase.from('apps').delete().eq('id', deleteModalApp.id);

      if (!error) {
        setApps(apps.filter(a => a.id !== deleteModalApp.id));
        setActionSuccess(`Successfully deleted "${deleteModalApp.name}"`);
        setTimeout(() => setActionSuccess(''), 3000);
        setDeleteModalApp(null);
      } else {
        setErrorMessage(`Error deleting app from Supabase: ${error.message}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMessage(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                          (app.developer && app.developer.toLowerCase().includes(search.toLowerCase())) ||
                          app.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manage Applications</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Publish, unpublish, edit, feature, and update Android APK packages.
          </p>
        </div>

        <Link to="/admin/apps/new" className="btn-glass btn-primary">
          <Plus size={16} />
          <span>Add New App</span>
        </Link>
      </div>

      {/* Action Success Toast Alert */}
      {actionSuccess && (
        <div
          className="glass-panel fade-in"
          style={{
            padding: '14px 20px',
            background: 'rgba(16, 185, 129, 0.15)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess('')}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div
          className="glass-panel fade-in"
          style={{
            padding: '14px 20px',
            background: 'rgba(244, 63, 94, 0.15)',
            borderColor: 'rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search by name, slug, or developer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input"
            style={{ paddingLeft: '38px', height: '40px', fontSize: '0.88rem' }}
          />
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input"
            style={{ height: '40px', padding: '0 12px', fontSize: '0.85rem', width: 'auto' }}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-panel" style={{ padding: '0', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
            <p>Loading applications from Supabase...</p>
          </div>
        ) : filteredApps.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--glass-bg-heavy)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>App</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Current Version</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Featured</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Publish Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const iconUrl = app.icon_url ? getStoragePublicUrl(app.icon_url) : null;
                  const currentVer = app.app_versions?.find(v => v.is_current) || app.app_versions?.[0];
                  const isPublished = app.status === 'published';
                  const isUpdating = updatingAppId === app.id;

                  return (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: '1px solid var(--glass-border)',
                        transition: 'background var(--transition-fast)'
                      }}
                      className="table-row-hover"
                    >
                      {/* App Name & Icon */}
                      <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'var(--glass-bg-hover)',
                            border: '1px solid var(--glass-border)',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}
                        >
                          {iconUrl && <img src={iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                            {app.name}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            /{app.slug}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 18px' }}>
                        <span className="glass-badge">
                          {app.categories?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Version */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>v{currentVer?.version || app.version || '1.0.0'}</span>
                          {currentVer?.apk_size && (
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {formatBytes(currentVer.apk_size)}
                            </span>
                          )}
                          {(!currentVer?.apk_url && !app.apk_url) && (
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#fb7185' }}>
                              ⚠️ No APK File
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Featured Switch */}
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => handleToggleFeatured(app)}
                          className="btn-glass"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            background: app.featured ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                            borderColor: app.featured ? 'rgba(245, 158, 11, 0.4)' : 'var(--glass-border)',
                            color: app.featured ? '#fbbf24' : 'var(--text-muted)'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>{app.featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Publish / Unpublish Action Button */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className="glass-badge"
                            style={{
                              background: isPublished ? 'rgba(16, 185, 129, 0.15)' : app.status === 'draft' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                              color: isPublished ? '#34d399' : app.status === 'draft' ? '#fbbf24' : '#94a3b8',
                              borderColor: isPublished ? 'rgba(16, 185, 129, 0.4)' : 'var(--glass-border)'
                            }}
                          >
                            {app.status || 'draft'}
                          </span>

                          <button
                            onClick={() => handleTogglePublish(app)}
                            disabled={isUpdating}
                            className={`btn-glass ${isPublished ? 'btn-danger' : 'btn-primary'}`}
                            style={{
                              padding: '4px 12px',
                              fontSize: '0.78rem',
                              height: '30px'
                            }}
                            title={isPublished ? 'Unpublish from store' : 'Publish to live store'}
                          >
                            {isUpdating ? (
                              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : isPublished ? (
                              <>
                                <EyeOff size={12} />
                                <span>Unpublish</span>
                              </>
                            ) : (
                              <>
                                <Globe size={12} />
                                <span>Publish</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Link
                            to={`/apk/${app.slug}`}
                            target="_blank"
                            className="btn-glass"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="View public page"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/admin/apps/edit/${app.id}`}
                            className="btn-glass"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="Edit app and update APK"
                          >
                            <Edit3 size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteModalApp(app)}
                            className="btn-glass btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="Delete app"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No applications match your filter criteria.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(5, 8, 15, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={20} color="#fb7185" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Confirm App Deletion</h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete <strong>{deleteModalApp.name}</strong>?
              This will remove the application, version history, and screenshot links from the database.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteModalApp(null)}
                disabled={isDeleting}
                className="btn-glass"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteApp}
                disabled={isDeleting}
                className="btn-glass btn-danger"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background: var(--glass-bg-hover);
        }
      `}</style>
    </div>
  );
}
