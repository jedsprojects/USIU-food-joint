import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const MAP_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBchA1HqWeEe8TG7c-FIazEGp15hDdUTfFcPwVAC0eXy9nHh-94fLmdRYGItRCZqm5wL-nxzEg4xOOzihwTcxwcLmwzDwLIvl-2ROvSqz31Wpv4f06hovw6qq24Xmyl1RmyJHSEBD5NSzlNBmLIC9BXq9Cih5Q_PgyGdoFVBCApSLJs-jpRxw170D-I5tlqs_0ZFyiq-gVZ112FO_dmkqg7hQv09gxuL1FtgXk8vdIaKTB6P177hVX0-YUj9jJGTEjqfGiZyFOKQr5O';

const ADDRESSES = [
  {
    id: 'loft',
    icon: 'home',
    label: 'Modern Loft',
    detail: '422 Artisan Way, Suite 802\nThe Gastronomy District, NY 10012',
    isDefault: true,
  },
  {
    id: 'office',
    icon: 'work',
    label: 'Corporate Studio',
    detail: '88 Fifth Avenue, Floor 14\nMidtown Excellence, NY 10001',
    isDefault: false,
  },
];

type DeliveryMethod = 'standard' | 'priority';

export default function DeliveryView() {
  const { cartTotal: total } = useStore();
  const [selectedAddress, setSelectedAddress] = useState('loft');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('priority');

  const deliveryCharge = deliveryMethod === 'priority' ? 12.00 : 5.00;
  const orderTotal = total + deliveryCharge;

  const selectedAddr = ADDRESSES.find(a => a.id === selectedAddress)!;

  return (
    <div className="delivery-view app-view fade-in-up" style={{ paddingBottom: 'calc(var(--layout-bottom-offset) + 30px)' }}>
      {/* Progress Stepper */}
      <section className="progress-stepper">
        <StepItem label="Cart" done />
        <div className="progress-stepper__line progress-stepper__line--done" />
        <StepItem label="Delivery" active stepNum={2} />
        <div className="progress-stepper__line" />
        <StepItem label="Payment" stepNum={3} />
      </section>

      {/* Delivery Address */}
      <section className="delivery-section">
        <div className="delivery-section__header">
          <h2 className="font-headline-md" style={{ color: 'var(--color-on-surface)' }}>Delivery Address</h2>
          <button className="add-new-btn ripple-btn" aria-label="Add new address">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            Add New
          </button>
        </div>
        <div className="address-cards scroll-hide">
          {ADDRESSES.map(addr => (
            <div
              key={addr.id}
              className={`address-card ${selectedAddress === addr.id ? 'address-card--active' : ''}`}
              onClick={() => setSelectedAddress(addr.id)}
              role="button"
              tabIndex={0}
            >
              <div className="address-card__top">
                <span className="material-symbols-outlined" style={{ color: selectedAddress === addr.id ? 'var(--color-primary-container)' : 'var(--color-on-surface-variant)', opacity: selectedAddress === addr.id ? 1 : 0.5 }}>
                  {addr.icon}
                </span>
                {addr.isDefault && (
                  <span className="badge badge--ghost" style={{ fontSize: '10px' }}>Default</span>
                )}
              </div>
              <p className="font-headline-md" style={{ fontSize: '18px', marginBottom: '4px', color: selectedAddress === addr.id ? 'var(--color-on-secondary)' : 'var(--color-on-surface)' }}>
                {addr.label}
              </p>
              <p className="font-body-md" style={{ opacity: 0.7, color: selectedAddress === addr.id ? 'var(--color-on-secondary)' : 'var(--color-on-surface-variant)', lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: '14px' }}>
                {addr.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Info */}
      <section className="delivery-section">
        <h2 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-sm)' }}>
          Contact Information
        </h2>
        <div className="contact-grid">
          <FormField label="Full Name" type="text" defaultValue="Julian Montgomery" id="contact-name" />
          <FormField label="Phone Number" type="tel" defaultValue="+1 (555) 012-3456" id="contact-phone" />
        </div>
      </section>

      {/* Delivery Method */}
      <section className="delivery-section">
        <h2 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-sm)' }}>
          Delivery Method
        </h2>
        <div className="delivery-methods">
          <DeliveryOption
            id="method-standard"
            icon="speed"
            label="Standard Delivery"
            detail="25 – 40 minutes"
            price={5.00}
            selected={deliveryMethod === 'standard'}
            onSelect={() => setDeliveryMethod('standard')}
          />
          <DeliveryOption
            id="method-priority"
            icon="bolt"
            label="Priority Indulgence"
            detail="10 – 20 minutes • Direct Route"
            price={12.00}
            selected={deliveryMethod === 'priority'}
            onSelect={() => setDeliveryMethod('priority')}
            badge="Fastest"
            premium
          />
        </div>
      </section>

      {/* Sticky Footer */}
      <footer className="delivery-footer glass-panel">
        <div className="delivery-footer__address">
          <div className="delivery-footer__map">
            <img src={MAP_IMG} alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p className="font-label-md" style={{ color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Delivering to {selectedAddr.label}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedAddr.detail.split('\n')[0]}...
            </p>
          </div>
        </div>
        <div className="delivery-footer__right">
          <div style={{ textAlign: 'right' }}>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.6 }}>Total Order</p>
            <p className="font-price-display" style={{ fontSize: '24px', color: 'var(--color-on-surface)' }}>
              Ksh {orderTotal}
            </p>
          </div>
          <button id="continue-payment-btn" className="delivery-cta-btn ripple-btn" aria-label="Continue to Payment">
            Continue to Payment
          </button>
        </div>
      </footer>
    </div>
  );
}

function StepItem({ label, done, active, stepNum }: { label: string; done?: boolean; active?: boolean; stepNum?: number }) {
  return (
    <div className="step-item">
      <div className={`step-circle ${done ? 'step-circle--done' : active ? 'step-circle--active' : ''}`}>
        {done ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span> : stepNum}
      </div>
      <span className={`font-label-md step-label ${active ? 'step-label--active' : ''}`}>{label}</span>
    </div>
  );
}

function FormField({ label, type, defaultValue, id }: { label: string; type: string; defaultValue: string; id: string }) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="font-label-md form-label">{label}</label>
      <input id={id} type={type} defaultValue={defaultValue} className="form-input font-body-md" />
    </div>
  );
}

function DeliveryOption({
  id, icon, label, detail, price, selected, onSelect, badge, premium,
}: {
  id: string; icon: string; label: string; detail: string; price: number;
  selected: boolean; onSelect: () => void; badge?: string; premium?: boolean;
}) {
  return (
    <div
      id={id}
      className={`delivery-option ${selected ? 'delivery-option--selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
    >
      <div className={`delivery-option__icon ${premium && selected ? 'delivery-option__icon--premium' : ''}`}>
        <span className={`material-symbols-outlined ${premium && selected ? 'fill-1' : ''}`} style={{ fontSize: '28px' }}>
          {icon}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <p className="font-headline-md" style={{ fontSize: '18px', color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {label}
          {badge && <span className="badge badge--gold" style={{ fontSize: '10px' }}>{badge}</span>}
        </p>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>{detail}</p>
      </div>
      <span className="font-price-display" style={{ color: 'var(--color-on-surface)' }}>Ksh {price}</span>
    </div>
  );
}
