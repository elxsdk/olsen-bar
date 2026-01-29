import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-md)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--color-bg-tertiary)',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{
          padding: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-bg-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'var(--color-bg-secondary)',
          zIndex: 1
        }}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: 'var(--color-text-secondary)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 'var(--spacing-md)' }}>
          {children}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
