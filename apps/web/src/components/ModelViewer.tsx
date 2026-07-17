'use client';

import React, { useRef, useState } from 'react';
import Script from 'next/script';

// Extend JSX IntrinsicElements to include model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'model-viewer': any;
      }
    }
  }
}

interface ModelViewerProps {
  src: string;
  alt?: string;
  poster?: string;
}

export default function ModelViewer({ src, alt, poster }: ModelViewerProps) {
  const viewerRef = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const handleReset = () => {
    if (viewerRef.current) {
      // model-viewer DOM element methods
      viewerRef.current.cameraOrbit = '0deg 75deg 105%';
      viewerRef.current.cameraTarget = 'auto auto auto';
      if (viewerRef.current.resetTurntableRotation) {
        viewerRef.current.resetTurntableRotation();
      }
    }
  };

  return (
    <div className="model-viewer-container" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--surface-2)', borderRadius: '12px', overflow: 'hidden' }}>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
        strategy="lazyOnload"
      />

      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt || "3D model"}
        poster={poster}
        auto-rotate={autoRotate ? true : undefined}
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', outline: 'none' }}
      >
        <div slot="progress-bar" style={{ display: 'none' }}></div>
      </model-viewer>

      {/* Controls Overlay */}
      <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '24px', backdropFilter: 'blur(4px)' }}>
        <button 
          onClick={() => setAutoRotate(!autoRotate)}
          style={{ background: autoRotate ? 'var(--accent)' : 'var(--surface)', color: autoRotate ? 'var(--surface)' : 'var(--text)', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
        >
          {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
        </button>
        <button 
          onClick={handleReset}
          style={{ background: 'var(--surface)', color: 'var(--text)', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
