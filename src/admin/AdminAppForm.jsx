import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, UploadCloud, Save, Sparkles, Image as ImageIcon, 
  Smartphone, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, FileCode,
  Globe, EyeOff, Check, ArrowRight, AlertTriangle
} from 'lucide-react';
import { 
  supabase, formatBytes, getStoragePublicUrl, uploadAssetToStorage, 
  STORAGE_BUCKET, getMimeType, sanitizeStorageFilename 
} from '../lib/supabase';

export default function AdminAppForm() {
  const { id } = useParams(); // If id exists -> Edit mode; else -> Create mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const formRef = useRef(null);

  // Basic Information State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [developer, setDeveloper] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('published');

  // Icon State
  const [iconUrl, setIconUrl] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');

  // Screenshots State
  const [screenshots, setScreenshots] = useState([]); // [{ id, image_url, sort_order, isNew, file }]

  // APK & Version State
  const [version, setVersion] = useState('1.0.0');
  const [apkFile, setApkFile] = useState(null);
  const [apkFilename, setApkFilename] = useState('');
  const [apkSize, setApkSize] = useState(0);
  const [apkUrl, setApkUrl] = useState('');
  const [androidVersion, setAndroidVersion] = useState('Android 7.0+');
  const [architecture, setArchitecture] = useState('arm64-v8a');
  const [whatsNew, setWhatsNew] = useState('');

  // UI / Async Progress State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-generate slug from name if in create mode and slug not manually modified
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEdit) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  // Load categories & existing app data if in edit mode
  useEffect(() => {
    async function initFormData() {
      try {
        console.log('[AdminAppForm] Initializing form. isEdit:', isEdit, 'id:', id);

        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (catError) {
          console.error('[AdminAppForm] Error loading categories:', catError);
          setErrorMessage(`Could not load categories: ${catError.message}`);
        } else {
          setCategories(catData || []);
          if (catData && catData.length > 0 && !categoryId) {
            setCategoryId(catData[0].id);
          }
        }

        // If Edit mode, load app and current version
        if (isEdit) {
          const { data: appData, error: appError } = await supabase
            .from('apps')
            .select(`
              *,
              app_versions (*),
              app_screenshots (*)
            `)
            .eq('id', id)
            .single();

          if (appError || !appData) {
            console.error('[AdminAppForm] Error loading app:', appError);
            setErrorMessage(`Could not load application: ${appError?.message || 'App not found'}`);
            return;
          }

          console.log('[AdminAppForm] Loaded existing app data:', appData);
          setName(appData.name || '');
          setSlug(appData.slug || '');
          setShortDescription(appData.short_description || '');
          setDescription(appData.description || '');
          setDeveloper(appData.developer || '');
          setCategoryId(appData.category_id || '');
          setFeatured(Boolean(appData.featured));
          setStatus(appData.status || 'published');
          setIconUrl(appData.icon_url || '');

          // Find current version
          const currentVer = appData.app_versions?.find(v => v.is_current) || appData.app_versions?.[0];
          if (currentVer) {
            setVersion(currentVer.version || '1.0.0');
            setApkUrl(currentVer.apk_url || '');
            setApkSize(currentVer.apk_size || 0);
            setAndroidVersion(currentVer.android_version || 'Android 7.0+');
            setArchitecture(currentVer.architecture || 'arm64-v8a');
            setWhatsNew(currentVer.whats_new || '');
          }

          // Screenshots
          if (appData.app_screenshots) {
            setScreenshots(appData.app_screenshots.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
          }
        }
      } catch (err) {
        console.error('[AdminAppForm] Form init error:', err);
        setErrorMessage(`Initialization error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    initFormData();
  }, [id, isEdit]);

  // Handle icon selection
  const handleIconSelect = (e) => {
    const file = e.target.files?.[0];
    console.log('[AdminAppForm] Icon selected:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      isFile: file instanceof File
    });
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  // Handle screenshot file addition
  const handleScreenshotSelect = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('[AdminAppForm] Screenshots selected count:', files.length);
    if (files.length > 0) {
      const previews = files.map((file, idx) => ({
        id: `temp-${Date.now()}-${idx}`,
        image_url: URL.createObjectURL(file),
        file,
        isNew: true
      }));
      setScreenshots([...screenshots, ...previews]);
    }
  };

  // Remove screenshot
  const handleRemoveScreenshot = (item) => {
    setScreenshots(screenshots.filter(s => s.id !== item.id));
  };

  // Handle APK file drop / select
  const handleApkSelect = (e) => {
    const file = e.target.files?.[0];
    console.log('[AdminAppForm] APK File selected:', {
      file,
      name: file?.name,
      type: file?.type,
      size: file?.size,
      isFileInstance: file instanceof File
    });

    if (!file) {
      return;
    }

    // Verify .apk extension
    if (!file.name.toLowerCase().endsWith('.apk')) {
      const errorMsg = `Selected file "${file.name}" is not an Android APK (.apk) file.`;
      console.warn('[AdminAppForm]', errorMsg);
      setErrorMessage(errorMsg);
      setApkFile(null);
      setApkFilename('');
      setApkSize(0);
      return;
    }

    setApkFile(file);
    setApkFilename(file.name);
    setApkSize(file.size);
    setErrorMessage('');
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    console.log('[AdminAppForm] handleSubmit triggered.');
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Validate Basic Info
    if (!name.trim()) {
      const msg = 'Please enter an Application Name.';
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!slug.trim()) {
      const msg = 'Please enter a URL Slug.';
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!categoryId) {
      const msg = 'Please select a Category.';
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Validate APK presence
    const hasApk = Boolean(apkFile || apkUrl);
    if (!hasApk) {
      const msg = 'Please select an APK file.';
      console.warn('[AdminAppForm] No APK file provided.');
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (apkFile && !(apkFile instanceof File)) {
      const msg = 'The selected APK is not a valid File object.';
      console.error('[AdminAppForm]', msg, apkFile);
      setErrorMessage(msg);
      return;
    }

    try {
      setSubmitting(true);

      // STEP 1: Insert or Update core record in public.apps using ONLY existing columns
      setUploadProgressText('Saving application...');
      console.log('[AdminAppForm] [Step 1] Saving application record in public.apps...');

      let appId = id;
      const appPayload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        short_description: shortDescription.trim(),
        description: description.trim(),
        developer: developer.trim(),
        category_id: categoryId || null,
        icon_url: iconUrl || null,
        featured: Boolean(featured),
        status: status || 'draft',
        updated_at: new Date().toISOString()
      };

      console.log('[AdminAppForm] Sending appPayload to public.apps:', appPayload);

      if (isEdit) {
        const { data: updateData, error: updateError } = await supabase
          .from('apps')
          .update(appPayload)
          .eq('id', id)
          .select();

        console.log('[AdminAppForm] App update response:', { data: updateData, error: updateError });
        if (updateError) {
          throw new Error(`Database error updating app: ${updateError.message} (${updateError.code || ''})`);
        }
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('apps')
          .insert([{ ...appPayload, created_at: new Date().toISOString() }])
          .select()
          .single();

        console.log('[AdminAppForm] App insert response:', { data: insertData, error: insertError });
        if (insertError) {
          throw new Error(`Database error creating app: ${insertError.message} (${insertError.code || ''})`);
        }
        appId = insertData.id;
      }

      console.log('[AdminAppForm] Target App ID confirmed:', appId);

      // STEP 2: Upload Icon if a new icon file was selected
      let finalIconUrl = iconUrl;
      if (iconFile && iconFile instanceof File) {
        setUploadProgressText('Uploading icon...');
        console.log('[AdminAppForm] [Step 2] Uploading Icon to bucket "app-assets"...');

        const cleanIconName = sanitizeStorageFilename(iconFile.name);
        const iconPath = `icons/${sanitizeStorageFilename(slug)}_${Date.now()}_${cleanIconName}`;
        const iconMime = getMimeType(iconFile.name, iconFile.type || 'image/png');

        console.log('[AdminAppForm] Uploading icon with params:', {
          bucket: STORAGE_BUCKET,
          path: iconPath,
          mimeType: iconMime,
          size: iconFile.size
        });

        const { data: iconUploadData, error: iconUploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(iconPath, iconFile, {
            contentType: iconMime,
            cacheControl: '3600',
            upsert: false
          });

        console.log('[AdminAppForm] Icon upload response:', { data: iconUploadData, error: iconUploadError });
        if (iconUploadError) {
          throw new Error(`Icon upload failed: ${iconUploadError.message}`);
        }

        const { data: iconPublicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(iconUploadData.path);
        finalIconUrl = iconPublicData.publicUrl;
        console.log('[AdminAppForm] Icon public URL:', finalIconUrl);

        // Update apps.icon_url
        const { error: iconDbError } = await supabase
          .from('apps')
          .update({ icon_url: finalIconUrl, updated_at: new Date().toISOString() })
          .eq('id', appId);

        if (iconDbError) {
          console.error('[AdminAppForm] Error saving icon URL in database:', iconDbError);
        }
      }

      // STEP 3: Upload APK to Supabase Storage if a new APK file was selected
      let finalApkUrl = apkUrl;
      let finalApkSize = apkSize;

      if (apkFile && apkFile instanceof File) {
        setUploadProgressText('Uploading APK...');
        console.log('[AdminAppForm] [Step 3] Uploading APK to Supabase Storage...');

        const cleanApkName = sanitizeStorageFilename(apkFile.name);
        const cleanSlug = sanitizeStorageFilename(slug);
        const cleanVer = sanitizeStorageFilename(version || '1.0.0');
        const apkStoragePath = `apks/${cleanSlug}_v${cleanVer}_${Date.now()}_${cleanApkName}`;
        const apkMimeType = 'application/vnd.android.package-archive';

        console.log('[AdminAppForm] Calling supabase.storage.upload with:', {
          bucket: STORAGE_BUCKET,
          storagePath: apkStoragePath,
          filename: apkFile.name,
          size: apkFile.size,
          mimeType: apkMimeType
        });

        // Exact upload requirement
        const { data: apkUploadData, error: apkUploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(apkStoragePath, apkFile, {
            contentType: apkMimeType,
            upsert: false
          });

        console.log('[AdminAppForm] Supabase APK upload response:', { data: apkUploadData, error: apkUploadError });

        if (apkUploadError) {
          throw new Error(`APK Storage Upload Failed: ${apkUploadError.message}`);
        }

        // Obtain public URL
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(apkUploadData.path);

        finalApkUrl = publicUrlData.publicUrl;
        finalApkSize = apkFile.size;
        console.log('[AdminAppForm] Obtained APK Public URL:', finalApkUrl);

        // Mark previous versions is_current = false
        if (isEdit) {
          console.log('[AdminAppForm] Setting existing versions is_current = false for app_id:', appId);
          await supabase
            .from('app_versions')
            .update({ is_current: false })
            .eq('app_id', appId);
        }

        // STEP 4: Insert new version into public.app_versions
        setUploadProgressText('Saving application version...');
        console.log('[AdminAppForm] [Step 4] Inserting version record in public.app_versions...');

        const versionPayload = {
          app_id: appId,
          version: version.trim() || '1.0.0',
          apk_url: finalApkUrl,
          apk_size: finalApkSize || 0,
          android_version: androidVersion.trim() || 'Android 7.0+',
          architecture: architecture.trim() || 'arm64-v8a',
          whats_new: whatsNew.trim() || 'Initial release',
          is_current: true,
          created_at: new Date().toISOString()
        };

        console.log('[AdminAppForm] Version payload:', versionPayload);

        const { data: verInsertData, error: verInsertError } = await supabase
          .from('app_versions')
          .insert([versionPayload])
          .select()
          .single();

        console.log('[AdminAppForm] Database version insert response:', { data: verInsertData, error: verInsertError });
        if (verInsertError) {
          throw new Error(`Database error saving APK version: ${verInsertError.message}`);
        }
      } else if (isEdit) {
        // Update current version metadata
        setUploadProgressText('Saving application version...');
        console.log('[AdminAppForm] Updating existing version metadata...');

        const { data: currentVer } = await supabase
          .from('app_versions')
          .select('id')
          .eq('app_id', appId)
          .eq('is_current', true)
          .maybeSingle();

        const versionMetadata = {
          version: version.trim() || '1.0.0',
          android_version: androidVersion.trim() || 'Android 7.0+',
          architecture: architecture.trim() || 'arm64-v8a',
          whats_new: whatsNew.trim() || 'Updated release'
        };

        if (currentVer) {
          const { error: verUpdateError } = await supabase
            .from('app_versions')
            .update(versionMetadata)
            .eq('id', currentVer.id);
          if (verUpdateError) console.error('[AdminAppForm] Error updating version:', verUpdateError);
        }
      }

      // STEP 5: Upload Screenshots if any new screenshots selected
      const existingScreenshotsToKeep = screenshots.filter(s => !s.isNew);
      const newScreenshotsToUpload = screenshots.filter(s => s.isNew && s.file && s.file instanceof File);

      if (isEdit) {
        const keptIds = existingScreenshotsToKeep.map(s => s.id);
        if (keptIds.length > 0) {
          await supabase.from('app_screenshots').delete().eq('app_id', appId).not('id', 'in', `(${keptIds.join(',')})`);
        } else {
          await supabase.from('app_screenshots').delete().eq('app_id', appId);
        }
      }

      if (newScreenshotsToUpload.length > 0) {
        setUploadProgressText('Uploading screenshots...');
        console.log('[AdminAppForm] [Step 5] Uploading', newScreenshotsToUpload.length, 'screenshots...');

        for (let i = 0; i < newScreenshotsToUpload.length; i++) {
          const item = newScreenshotsToUpload[i];
          const cleanShotName = sanitizeStorageFilename(item.file.name);
          const shotPath = `screenshots/${sanitizeStorageFilename(slug)}_shot_${i}_${Date.now()}_${cleanShotName}`;
          const shotMime = getMimeType(item.file.name, item.file.type || 'image/png');

          const { data: shotData, error: shotError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(shotPath, item.file, {
              contentType: shotMime,
              cacheControl: '3600',
              upsert: false
            });

          if (shotError) {
            console.error('[AdminAppForm] Error uploading screenshot', i, shotError);
          } else {
            const { data: shotPublicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(shotData.path);
            await supabase.from('app_screenshots').insert([{
              app_id: appId,
              image_url: shotPublicData.publicUrl,
              sort_order: existingScreenshotsToKeep.length + i,
              created_at: new Date().toISOString()
            }]);
          }
        }
      }

      // STEP 6: If Publish is selected, update apps.status = 'published'
      if (status === 'published') {
        setUploadProgressText('Publishing application...');
        console.log('[AdminAppForm] [Step 6] Setting apps.status = "published" for appId:', appId);

        const { error: pubError } = await supabase
          .from('apps')
          .update({ status: 'published', updated_at: new Date().toISOString() })
          .eq('id', appId);

        if (pubError) {
          throw new Error(`Database error setting published status: ${pubError.message}`);
        }
      }

      // Final success
      const finalMsg = status === 'published' ? 'Application published successfully' : 'Application saved successfully';
      setUploadProgressText(finalMsg);
      setSuccessMessage(finalMsg);
      console.log('[AdminAppForm] SUCCESS:', finalMsg);

      setTimeout(() => {
        navigate('/admin/apps');
      }, 1500);

    } catch (err) {
      console.error('[AdminAppForm] Critical Upload / Save Error:', err);
      setErrorMessage(err.message || 'An error occurred while uploading/saving application.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
        <p>Loading application editor...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link
            to="/admin/apps"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '8px' }}
          >
            <ArrowLeft size={14} /> Back to Applications
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {isEdit ? `Edit: ${name || 'Application'}` : 'Create New Application'}
          </h1>
        </div>
      </div>

      {/* Upload Progress Live Status Card */}
      {submitting && (
        <div
          className="glass-panel fade-in"
          style={{
            padding: '20px 24px',
            background: 'rgba(14, 165, 233, 0.15)',
            borderColor: 'rgba(56, 189, 248, 0.4)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {uploadProgressText || 'Uploading and Saving...'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Please keep this page open while files are transferred to Supabase Storage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Error Alert */}
      {errorMessage && (
        <div
          className="glass-panel fade-in"
          style={{
            padding: '16px 20px',
            background: 'rgba(244, 63, 94, 0.15)',
            borderColor: 'rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', marginBottom: '2px' }}>Upload / Save Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Top Success Alert */}
      {successMessage && (
        <div
          className="glass-panel fade-in"
          style={{
            padding: '16px 20px',
            background: 'rgba(16, 185, 129, 0.15)',
            borderColor: 'rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <form ref={formRef} noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section 1: Basic App Details */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={18} color="var(--primary)" /> Basic App Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Application Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. APK Hub"
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
                placeholder="e.g. apk-hub"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Developer / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. DevStudio"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="glass-input"
                style={{ cursor: 'pointer' }}
                required
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Short Summary Description
            </label>
            <input
              type="text"
              placeholder="A brief 1-line overview of the application..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="glass-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Full Description
            </label>
            <textarea
              rows={4}
              placeholder="Detailed app overview, features, highlights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section 2: App Icon & Screenshots */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="var(--primary)" /> App Icon & Screenshots
          </h2>

          {/* Icon Upload Row */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'var(--glass-bg-hover)',
                border: '1px solid var(--glass-border-highlight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {iconPreview || iconUrl ? (
                <img src={iconPreview || getStoragePublicUrl(iconUrl)} alt="Icon preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={32} color="var(--text-muted)" />
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Application Icon (PNG, JPG, WebP)
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {iconFile ? `Selected: ${iconFile.name} (${formatBytes(iconFile.size)})` : (iconUrl ? 'Current icon uploaded' : 'Select a square icon image.')}
              </p>
              <label className="btn-glass" style={{ cursor: 'pointer', display: 'inline-flex', padding: '6px 14px', fontSize: '0.85rem' }}>
                <UploadCloud size={16} /> {iconFile || iconUrl ? 'Replace Icon' : 'Choose Icon File'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={handleIconSelect} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Screenshots Gallery Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block' }}>App Screenshots</span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Add preview screenshots for the user marketplace.</p>
              </div>
              <label className="btn-glass" style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add Screenshots
                <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" onChange={handleScreenshotSelect} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Screenshots grid */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 0' }}>
              {screenshots.map((s, idx) => {
                const imgSource = s.image_url.startsWith('blob:') ? s.image_url : getStoragePublicUrl(s.image_url);
                return (
                  <div
                    key={s.id || idx}
                    style={{
                      width: '120px',
                      height: '210px',
                      borderRadius: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <img src={imgSource} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(s)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'rgba(244, 63, 94, 0.85)',
                        border: 'none',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: APK Package & Version Details */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} color="var(--primary)" /> APK Binary & Version Details *
          </h2>

          {/* APK Upload Drop Area */}
          <div
            style={{
              padding: '28px 24px',
              borderRadius: 'var(--radius-lg)',
              border: apkFile ? '2px solid var(--primary)' : '2px dashed var(--glass-border-highlight)',
              background: apkFile ? 'rgba(14, 165, 233, 0.08)' : 'var(--glass-bg-subtle)',
              textAlign: 'center',
              marginBottom: '24px',
              transition: 'all var(--transition-normal)'
            }}
          >
            <UploadCloud size={40} color={apkFile ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 10px auto' }} />
            
            {apkFile ? (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={18} color="var(--accent-emerald)" /> {apkFilename}
                </p>
                <span className="glass-badge" style={{ marginTop: '6px', background: 'var(--badge-bg)' }}>
                  Size: {formatBytes(apkSize)} • Type: application/vnd.android.package-archive
                </span>
              </div>
            ) : apkUrl ? (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Current APK is linked in Supabase Storage
                </p>
                {apkSize > 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Package Size: {formatBytes(apkSize)}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Select an Android Application Package (.apk)
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Bucket: <code>app-assets</code> • MIME: <code>application/vnd.android.package-archive</code>
                </p>
              </div>
            )}

            <label className="btn-glass btn-primary" style={{ cursor: 'pointer', padding: '10px 22px', fontSize: '0.9rem' }}>
              <span>{apkFile || apkUrl ? 'Replace / Upload New APK' : 'Browse APK File (.apk)'}</span>
              <input type="file" accept=".apk,application/vnd.android.package-archive" onChange={handleApkSelect} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Version String *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Min Android Requirement
              </label>
              <input
                type="text"
                placeholder="e.g. Android 7.0+"
                value={androidVersion}
                onChange={(e) => setAndroidVersion(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Architecture
              </label>
              <input
                type="text"
                placeholder="e.g. arm64-v8a"
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              What's New / Release Notes
            </label>
            <textarea
              rows={3}
              placeholder="• New features, performance updates, or fixes..."
              value={whatsNew}
              onChange={(e) => setWhatsNew(e.target.value)}
              className="glass-input"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section 4: Publishing & Visibility */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
            Publishing Status & Visibility
          </h2>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '240px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                App Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="glass-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="published">Published (Live in marketplace)</option>
                <option value="draft">Draft (Saved privately)</option>
                <option value="unpublished">Unpublished (Hidden from store)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              <input
                type="checkbox"
                id="featuredCheckbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="featuredCheckbox" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#fbbf24" /> Mark as Featured on Homepage
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Error Alert (Visible immediately above buttons) */}
        {errorMessage && (
          <div
            className="glass-panel fade-in"
            style={{
              padding: '16px 20px',
              background: 'rgba(244, 63, 94, 0.15)',
              borderColor: 'rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '2px' }}>Upload / Save Error</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
          <Link to="/admin/apps" className="btn-glass">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-glass btn-primary"
            style={{ padding: '0 32px', height: '50px', minWidth: '220px', fontSize: '1rem' }}
          >
            {submitting ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{uploadProgressText || 'Uploading APK & Saving...'}</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{isEdit ? 'Save Application' : (status === 'published' ? 'Upload & Publish App' : 'Save as Draft')}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
