import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Edit3, Trash2, CheckCircle2, 
  AlertCircle, X, Loader2 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconName, setIconName] = useState('Layers');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          apps (id)
        `)
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditCat(null);
    setName('');
    setSlug('');
    setIconName('Layers');
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCat(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setIconName(cat.icon || 'Layers');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!editCat) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMessage('Name and slug are required.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: iconName || 'Layers',
        updated_at: new Date().toISOString()
      };

      if (editCat) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editCat.id);
        if (error) throw error;
        setStatusMessage(`Updated category "${name}"`);
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
        setStatusMessage(`Created new category "${name}"`);
      }

      setModalOpen(false);
      loadCategories();
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Error saving category:', err);
      setErrorMessage(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const appCount = cat.apps?.length || 0;
    if (appCount > 0) {
      alert(`Cannot delete "${cat.name}" because it contains ${appCount} applications. Reassign or delete those apps first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (!error) {
        setCategories(categories.filter(c => c.id !== cat.id));
        setStatusMessage(`Deleted category "${cat.name}"`);
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        alert('Error: ' + error.message);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manage Categories</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Organize applications by department, genre, and utility.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-glass btn-primary">
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Success Alert */}
      {statusMessage && (
        <div
          className="glass-panel"
          style={{
            padding: '12px 20px',
            background: 'rgba(16, 185, 129, 0.15)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="glass-panel" style={{ padding: '0', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
            <p>Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--glass-bg-heavy)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Category Name</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>URL Slug</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Apps Count</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--badge-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Layers size={16} color="var(--primary)" />
                      </div>
                      <strong style={{ color: 'var(--text-primary)' }}>{cat.name}</strong>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      /{cat.slug}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="glass-badge">
                        {cat.apps?.length || 0} apps
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn-glass"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="btn-glass btn-danger"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No categories defined yet.
          </div>
        )}
      </div>

      {/* Modal Dialog for Category Add / Edit */}
      {modalOpen && (
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
              maxWidth: '460px',
              padding: '28px',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn-glass" style={{ width: '32px', height: '32px', padding: 0 }}>
                <X size={16} />
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fb7185',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Productivity"
                  value={name}
                  onChange={handleNameChange}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. productivity"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-glass">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-glass btn-primary">
                  {saving ? 'Saving...' : (editCat ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
