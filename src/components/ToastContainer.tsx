import { useToastStore } from '../utils/toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: 'calc(100% - 2 * var(--space-container-margin))',
      maxWidth: 'min(420px, var(--content-max-width))',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderRadius: '20px',
            background: toast.type === 'error'
              ? 'rgba(147, 0, 10, 0.9)'
              : 'rgba(18, 8, 14, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${
              toast.type === 'success' ? 'rgba(233, 195, 73, 0.35)'
              : toast.type === 'error' ? 'rgba(255, 100, 100, 0.3)'
              : 'rgba(255, 177, 196, 0.2)'
            }`,
            boxShadow: toast.type === 'success'
              ? '0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(233,195,73,0.1)'
              : '0 12px 32px rgba(0,0,0,0.4)',
            animation: 'toast-slide-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
            cursor: 'pointer',
            pointerEvents: 'all',
          }}
        >
          {toast.icon && (
            <span className="material-symbols-outlined fill-1" style={{
              fontSize: '20px',
              color: toast.type === 'success' ? 'var(--color-tertiary)'
                : toast.type === 'error' ? '#ff6b6b'
                : 'var(--color-primary)',
              flexShrink: 0,
            }}>
              {toast.icon}
            </span>
          )}
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-on-surface)',
            flex: 1,
          }}>
            {toast.message}
          </span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)', opacity: 0.5, flexShrink: 0 }}>
            close
          </span>
        </div>
      ))}
    </div>
  );
}
