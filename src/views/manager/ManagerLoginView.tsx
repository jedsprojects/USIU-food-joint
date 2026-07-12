import { useState } from 'react';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function ManagerLoginView({ onLogin, onBack }: Props) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'admin' || passcode.trim() === '1234') {
      onLogin();
    } else {
      setError('Incorrect manager credentials');
    }
  };

  return (
    <main className="manager-login">
      <button
        className="manager-back-btn manager-back-btn--fixed ripple-btn"
        onClick={onBack}
        aria-label="Back to customer app"
      >
        <span className="material-symbols-outlined">arrow_back_ios_new</span>
      </button>
      <div className="glass-panel manager-login__card">
        <img src="/kwagavo/logo.jpg" alt="Kwa Gavo" className="manager-login__logo" style={{ borderRadius: '50%' }} />

        <h1 className="font-headline-xl shimmer-text manager-login__title">Manager Entry</h1>
        <p className="font-body-md manager-login__subtitle">Access Kwa Gavo administrative controls</p>

        <form onSubmit={handleSubmit} className="manager-login__form">
          <div className="form-field">
            <label className="font-label-md form-label" style={{ color: 'var(--color-primary-fixed-dim)' }}>Passcode</label>
            <input
              type="password"
              placeholder="Enter passcode (hint: admin)"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              className="manager-login__input"
            />
          </div>

          {error && <p className="font-label-md manager-login__error">{error}</p>}

          <button type="submit" className="cart-checkout-btn ripple-btn manager-login__submit">
            <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Authenticate</span>
            <span className="material-symbols-outlined">login</span>
          </button>
        </form>
      </div>
    </main>
  );
}
