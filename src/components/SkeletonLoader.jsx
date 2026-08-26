import React from 'react';

export function AppCardSkeleton() {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minHeight: '220px'
      }}
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '16px', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton" style={{ width: '70%', height: '18px' }} />
          <div className="skeleton" style={{ width: '40%', height: '14px' }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: '36px' }} />
      <div className="skeleton" style={{ width: '100%', height: '30px', borderRadius: '8px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
        <div className="skeleton" style={{ height: '38px', borderRadius: '10px' }} />
        <div className="skeleton" style={{ height: '38px', borderRadius: '10px' }} />
      </div>
    </div>
  );
}

export function AppGridSkeleton({ count = 6 }) {
  return (
    <div className="grid-apps">
      {Array.from({ length: count }).map((_, i) => (
        <AppCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AppDetailsSkeleton() {
  return (
    <div className="container" style={{ paddingTop: '20px', maxWidth: '1000px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: '24px' }} />
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skeleton" style={{ width: '60%', height: '32px' }} />
            <div className="skeleton" style={{ width: '35%', height: '18px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px' }} />
          </div>
          <div className="skeleton" style={{ width: '180px', height: '48px', borderRadius: '12px' }} />
        </div>
      </div>
      <div className="glass-panel" style={{ height: '300px', padding: '24px' }}>
        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
