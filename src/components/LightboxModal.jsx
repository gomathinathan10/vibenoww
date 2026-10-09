import React from 'react';
import { X, Sparkles, User, Camera } from 'lucide-react';

export const LightboxModal = ({ isOpen, image, title, author, onClose, onBookStyle }) => {
  if (!isOpen || !image) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(5, 7, 12, 0.95)',
        backdropFilter: 'blur(15px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          position: 'relative',
          maxWidth: '1000px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-45px',
            right: 0,
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        <img
          src={image}
          alt={title || 'Portfolio detail'}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        />

        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#fff', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '700' }}>
              {title || 'Cinematic Capture'}
            </h4>
            {author && (
              <p style={{ color: 'var(--color-gold-warm)', fontSize: '0.85rem' }}>
                Shot by {author}
              </p>
            )}
          </div>

          <button
            className="btn btn-gold btn-sm"
            onClick={() => {
              onClose();
              if (onBookStyle) onBookStyle();
            }}
          >
            <Sparkles size={14} /> Book This Photography Style
          </button>
        </div>
      </div>
    </div>
  );
};
