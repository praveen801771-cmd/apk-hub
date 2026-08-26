import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getStoragePublicUrl } from '../lib/supabase';

export default function DownloadButton({ apkUrl, appName, version, filename, size, className = '', style = {} }) {
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'preparing' | 'downloading' | 'completed' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!apkUrl) {
      setDownloadState('error');
      setErrorMessage('APK package is not available for this version.');
      setTimeout(() => setDownloadState('idle'), 4000);
      return;
    }

    try {
      setDownloadState('preparing');
      setErrorMessage('');

      const targetUrl = getStoragePublicUrl(apkUrl);

      // Verify that URL is accessible
      setDownloadState('downloading');

      // Create a clean download anchor to trigger direct browser download
      const downloadName = filename || `${(appName || 'app').toLowerCase().replace(/\s+/g, '-')}-v${version || '1.0'}.apk`;

      const anchor = document.createElement('a');
      anchor.href = targetUrl;
      anchor.setAttribute('download', downloadName);
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setDownloadState('completed');
      setTimeout(() => {
        setDownloadState('idle');
      }, 3500);

    } catch (err) {
      console.error('Download error:', err);
      setDownloadState('error');
      setErrorMessage('Download failed. Please try again or check your connection.');
      setTimeout(() => setDownloadState('idle'), 4000);
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', ...style }}>
      <button
        onClick={handleDownload}
        disabled={downloadState === 'preparing' || downloadState === 'downloading'}
        className={`btn-glass btn-primary ${className}`}
        style={{
          minWidth: '160px',
          height: '46px',
          padding: '0 22px',
          background: downloadState === 'completed'
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : downloadState === 'error'
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : undefined
        }}
      >
        {downloadState === 'preparing' || downloadState === 'downloading' ? (
          <>
            <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Starting Download...</span>
          </>
        ) : downloadState === 'completed' ? (
          <>
            <CheckCircle size={18} />
            <span>Download Started</span>
          </>
        ) : downloadState === 'error' ? (
          <>
            <AlertCircle size={18} />
            <span>Unavailable</span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span>Download APK</span>
          </>
        )}
      </button>

      {errorMessage && (
        <span
          style={{
            fontSize: '0.78rem',
            color: '#f87171',
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertCircle size={14} /> {errorMessage}
        </span>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
