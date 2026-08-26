import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStoragePublicUrl } from '../lib/supabase';

export default function LightboxModal({ images, activeIndex, onClose, onNavigate }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && activeIndex > 0) onNavigate(activeIndex - 1);
      if (e.key === 'ArrowRight' && activeIndex < images.length - 1) onNavigate(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length, onClose, onNavigate]);

  if (activeIndex === null || !images || images.length === 0) return null;

  const currentImage = images[activeIndex];
  const imageUrl = getStoragePublicUrl(currentImage.image_url || currentImage);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="btn-glass"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '44px',
          height: '44px',
          padding: 0,
          borderRadius: '50%',
          zIndex: 10
        }}
        aria-label="Close fullscreen screenshot"
      >
        <X size={22} />
      </button>

      {/* Navigation Buttons */}
      {activeIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(activeIndex - 1);
          }}
          className="btn-glass"
          style={{
            position: 'absolute',
            left: '20px',
            width: '48px',
            height: '48px',
            padding: 0,
            borderRadius: '50%',
            zIndex: 10
          }}
          aria-label="Previous screenshot"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      {activeIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(activeIndex + 1);
          }}
          className="btn-glass"
          style={{
            position: 'absolute',
            right: '20px',
            width: '48px',
            height: '48px',
            padding: 0,
            borderRadius: '50%',
            zIndex: 10
          }}
          aria-label="Next screenshot"
        >
          <ChevronRight size={26} />
        </button>
      )}

      {/* Image Preview Container */}
      <div
        className="glass-panel"
        style={{
          maxWidth: '90vw',
          maxHeight: '85vh',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={`Screenshot ${activeIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)'
          }}
        />
      </div>

      {/* Counter Pill */}
      <div
        className="glass-badge"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 16px',
          fontSize: '0.85rem'
        }}
      >
        {activeIndex + 1} / {images.length}
      </div>
    </div>
  );
}
