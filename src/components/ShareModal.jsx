import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle } from 'lucide-react';

export default function ShareModal({ app, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !app) return null;

  const currentUrl = window.location.href;
  const shareText = `Check out ${app.name} on APK Store!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${app.name} - APK Store`,
          text: shareText,
          url: currentUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Native share failed:', err);
        }
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--badge-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Share2 size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Share App</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-glass"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Copy Link Row */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
            App Link
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="glass-input"
              style={{ fontSize: '0.85rem', padding: '10px 14px', flex: 1 }}
            />
            <button
              onClick={handleCopy}
              className={`btn-glass ${copied ? 'btn-primary' : ''}`}
              style={{ minWidth: '100px', height: '42px', padding: '0 14px' }}
            >
              {copied ? (
                <>
                  <Check size={16} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Social / Native Share Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="btn-glass"
              style={{ flexDirection: 'column', padding: '12px 8px', gap: '6px' }}
            >
              <Share2 size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem' }}>Device</span>
            </button>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass"
            style={{ flexDirection: 'column', padding: '12px 8px', gap: '6px' }}
          >
            <MessageCircle size={20} color="#25D366" />
            <span style={{ fontSize: '0.78rem' }}>WhatsApp</span>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass"
            style={{ flexDirection: 'column', padding: '12px 8px', gap: '6px' }}
          >
            <Send size={20} color="#229ED9" />
            <span style={{ fontSize: '0.78rem' }}>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
