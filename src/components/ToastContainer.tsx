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
            gap: '14px',
            padding: '16px 20px',
            borderRadius: '24px',
            background: toast.type === 'error'
              ? 'linear-gradient(135deg, rgba(147, 0, 10, 0.92) 0%, rgba(80, 0, 5, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(24, 10, 16, 0.94) 0%, rgba(18, 8, 14, 0.96) 100%)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: `1px solid ${
              toast.type === 'success' ? 'rgba(180, 150, 60, 0.35)'
              : toast.type === 'error' ? 'rgba(255, 100, 100, 0.3)'
              : 'rgba(200, 150, 168, 0.18)'
            }`,
            boxShadow: toast.type === 'success'
              ? '0 16px 48px rgba(0,0,0,0.5), 0 0 40px -10px rgba(233,195,73,0.15)'
              : toast.type === 'error'
              ? '0 16px 48px rgba(0,0,0,0.5), 0 0 40px -10px rgba(147,0,10,0.3)'
              : '0 16px 48px rgba(0,0,0,0.5)',
            animation: 'toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            cursor: 'pointer',
            pointerEvents: 'all' as const,
          }}
        >
          {toast.icon && (
            <span className="material-symbols-outlined fill-1" style={{
              fontSize: '22px',
              color: toast.type === 'success' ? 'var(--color-tertiary)'
                : toast.type === 'error' ? '#ff6b6b'
                : 'var(--color-primary)',
              flexShrink: 0,
              filter: toast.type === 'success' ? 'drop-shadow(0 0 8px rgba(233,195,73,0.4))' : 'none',
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
            letterSpacing: '0.01em',
            lineHeight: 1.4,
          }}>
            {toast.message}
          </span>
          <span className="material-symbols-outlined" style={{
            fontSize: '16px',
            color: 'var(--color-on-surface-variant)',
            opacity: 0.4,
            flexShrink: 0,
            transition: 'opacity 0.15s ease',
          }}>
            close
          </span>
        </div>
      ))}
    </div>
  );
}

