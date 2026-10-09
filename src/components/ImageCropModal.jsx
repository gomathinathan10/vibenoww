import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, Sparkles } from 'lucide-react';

/**
 * ImageCropModal
 * High-performance, touch & drag interactive crop modal tailored for creator profile photos.
 * Provides circular and square framing, zoom, 90-degree rotation, rule-of-thirds grid, and 512x512 export.
 */
export const ImageCropModal = ({
  isOpen,
  imageSrc,
  title = 'Crop Profile Picture',
  subtitle = 'Drag to position and adjust zoom for your creator profile avatar',
  onCropComplete,
  onCancel,
  cropShape = 'circle' // 'circle' | 'square'
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [shape, setShape] = useState(cropShape);
  const [previewDataUrl, setPreviewDataUrl] = useState('');

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const CROP_SIZE = 280; // Viewport display size in px
  const EXPORT_SIZE = 512; // Final cropped square dimension

  // Reset state when new image opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setShape(cropShape);
    }
  }, [isOpen, imageSrc, cropShape]);

  // Compute base scaling so image covers the crop area
  const getScale = useCallback(() => {
    if (!imgRef.current) return 1;
    const { naturalWidth, naturalHeight } = imgRef.current;
    if (!naturalWidth || !naturalHeight) return 1;
    const isRotated90or270 = rotation % 180 !== 0;
    const w = isRotated90or270 ? naturalHeight : naturalWidth;
    const h = isRotated90or270 ? naturalWidth : naturalHeight;
    const baseScale = Math.max(CROP_SIZE / w, CROP_SIZE / h);
    return baseScale * zoom;
  }, [zoom, rotation]);

  // Draw viewport canvas
  const drawViewport = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    const scale = getScale();

    ctx.save();
    ctx.translate(CROP_SIZE / 2 + pan.x, CROP_SIZE / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      -(img.naturalWidth * scale) / 2,
      -(img.naturalHeight * scale) / 2,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );
    ctx.restore();

    // Also update mini preview
    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      const pCtx = previewCanvas.getContext('2d');
      previewCanvas.width = 64;
      previewCanvas.height = 64;
      pCtx.clearRect(0, 0, 64, 64);
      pCtx.drawImage(canvas, 0, 0, 64, 64);
    }
  }, [pan, rotation, getScale]);

  useEffect(() => {
    drawViewport();
  }, [drawViewport]);

  // Mouse / Touch event handlers for dragging
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // Constrain pan within reasonable boundaries
    const maxPan = CROP_SIZE * 0.8 * zoom;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleApply = () => {
    const img = imgRef.current;
    if (!img) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = EXPORT_SIZE;
    exportCanvas.height = EXPORT_SIZE;
    const ctx = exportCanvas.getContext('2d');

    const exportRatio = EXPORT_SIZE / CROP_SIZE;
    const scale = getScale() * exportRatio;

    ctx.save();
    ctx.translate(EXPORT_SIZE / 2 + pan.x * exportRatio, EXPORT_SIZE / 2 + pan.y * exportRatio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      -(img.naturalWidth * scale) / 2,
      -(img.naturalHeight * scale) / 2,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );
    ctx.restore();

    // High quality JPEG data URL
    const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
    if (onCropComplete) {
      onCropComplete(croppedDataUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(3, 6, 16, 0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        overflowY: 'auto'
      }}
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#0d1326',
          border: '1.5px solid rgba(0, 210, 255, 0.5)',
          borderRadius: '22px',
          width: '100%',
          maxWidth: '460px',
          color: '#ffffff',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0,210,255,0.25)',
          position: 'relative',
          maxHeight: 'min(94vh, 680px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ overflowY: 'auto', overflowX: 'hidden', padding: '20px 20px 10px', flex: 1, minHeight: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <img src="/images/vibenoww-logo.png" alt="VibeNoww" style={{ height: '24px', width: 'auto', maxWidth: '60px', objectFit: 'contain', borderRadius: '4px' }} />
              <span style={{ color: '#00d2ff', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Creator Studio
              </span>
              <span style={{ background: 'rgba(0, 210, 255, 0.15)', border: '1px solid rgba(0, 210, 255, 0.35)', color: '#00d2ff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>
                Profile Cropper
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              {title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0', lineHeight: '1.4' }}>
              {subtitle}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Hidden Image for loading */}
        <img
          ref={imgRef}
          src={imageSrc}
          alt="To Crop"
          style={{ display: 'none' }}
          onLoad={() => {
            getScale();
            drawViewport();
          }}
          crossOrigin="anonymous"
        />

        {/* Crop Viewport Container */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: `${CROP_SIZE}px`,
            height: `${CROP_SIZE}px`,
            margin: '0 auto 16px',
            borderRadius: shape === 'circle' ? '50%' : '18px',
            overflow: 'hidden',
            boxShadow: '0 0 0 9999px rgba(8, 11, 20, 0.72), 0 0 25px rgba(0, 210, 255, 0.5)',
            border: '2px solid #00d2ff',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none'
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          {/* Canvas Rendering Image */}
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          />

          {/* Rule of thirds grid lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              border: '1px dashed rgba(255,255,255,0.25)',
              borderRadius: shape === 'circle' ? '50%' : '18px'
            }}
          >
            <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.18)' }} />
            <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.18)' }} />
            <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.18)' }} />
            <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.18)' }} />
          </div>

          {/* Hint Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.65)',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#cbd5e1',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <Move size={11} /> Drag to position
          </div>
        </div>

        {/* Live Preview & Shape Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 14px',
            borderRadius: '14px',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <canvas
              ref={previewCanvasRef}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #00d2ff',
                boxShadow: '0 0 10px rgba(0,210,255,0.4)',
                background: '#1a1f33'
              }}
            />
            <div>
              <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block' }}>Avatar Preview</span>
              <strong style={{ fontSize: '12.5px', color: '#fff' }}>Circular Profile Card</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setShape('circle')}
              style={{
                background: shape === 'circle' ? 'rgba(0, 210, 255, 0.25)' : 'transparent',
                border: shape === 'circle' ? '1px solid #00d2ff' : '1px solid rgba(255,255,255,0.12)',
                color: shape === 'circle' ? '#00d2ff' : '#94a3b8',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Circle
            </button>
            <button
              type="button"
              onClick={() => setShape('square')}
              style={{
                background: shape === 'square' ? 'rgba(0, 210, 255, 0.25)' : 'transparent',
                border: shape === 'square' ? '1px solid #00d2ff' : '1px solid rgba(255,255,255,0.12)',
                color: shape === 'square' ? '#00d2ff' : '#94a3b8',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Square
            </button>
          </div>
        </div>

        {/* Zoom & Rotate Controls */}
        <div style={{ marginBottom: '20px' }}>
          {/* Zoom Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#00d2ff',
                cursor: 'pointer'
              }}
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)))}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1',
                padding: '6px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>

            <span style={{ fontSize: '11.5px', color: '#94a3b8', minWidth: '36px', textAlign: 'right', fontWeight: '700' }}>
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Action Row: Rotate & Reset */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleRotate}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCw size={13} /> Rotate 90°
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              HD 512×512 Export
            </span>
          </div>
        </div>
        </div>

        {/* Sticky Footer: Submit button is ALWAYS visible */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 30,
          background: '#0d1326',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '14px 20px 16px',
          marginTop: 'auto',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 -10px 20px rgba(13, 19, 38, 0.85)'
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #0072ff 50%, #9333ea 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 4px 20px rgba(0, 210, 255, 0.5)',
              letterSpacing: '0.2px'
            }}
          >
            <Check size={16} /> Submit Cropped Photo
          </button>
        </div>
      </div>
    </div>
  );
};
