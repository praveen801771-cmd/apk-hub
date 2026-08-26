import React, { useState } from 'react';
import { Maximize2, Image as ImageIcon } from 'lucide-react';
import { getStoragePublicUrl } from '../lib/supabase';
import LightboxModal from './LightboxModal';

export default function ScreenshotGallery({ screenshots = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <ImageIcon size={32} style={{ opacity: 0.5 }} />
        <p style={{ fontSize: '0.9rem' }}>No screenshots uploaded for this application yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="screenshots-scroll-container">
        {screenshots.map((item, index) => {
          const url = getStoragePublicUrl(item.image_url || item);
          return (
            <div
              key={item.id || index}
              onClick={() => setLightboxIndex(index)}
              className="screenshot-card glass-panel"
              title="Click to view full size"
            >
              <img
                src={url}
                alt={`App Screenshot ${index + 1}`}
                loading="lazy"
                className="screenshot-img"
              />
              <div className="screenshot-overlay">
                <Maximize2 size={20} color="#ffffff" />
              </div>
            </div>
          );
        })}
      </div>

      <LightboxModal
        images={screenshots}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />

      <style>{`
        .screenshots-scroll-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding: 8px 4px 16px 4px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .screenshot-card {
          flex: 0 0 auto;
          width: 220px;
          height: 390px;
          border-radius: var(--radius-lg);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          scroll-snap-align: start;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
        }
        @media (min-width: 768px) {
          .screenshot-card {
            width: 250px;
            height: 440px;
          }
        }
        .screenshot-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
        }
        .screenshot-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .screenshot-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .screenshot-card:hover .screenshot-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
