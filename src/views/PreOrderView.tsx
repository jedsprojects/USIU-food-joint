import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { CustomerView, OrderType } from '../context/StoreContext';
import { addToast } from '../utils/toast';
import { uploadImage } from '../utils/cloudinary';

interface Props {
  onNavigate: (view: CustomerView) => void;
}

const PICKUP_TIMES = ['ASAP (~15 mins)', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '6:00 PM', '6:30 PM', '7:00 PM'];
const DELIVERY_TIMES = ['ASAP (~35 mins)', '12:15 PM – 12:45 PM', '12:45 PM – 1:15 PM', '1:15 PM – 1:45 PM', '6:15 PM – 6:45 PM', '6:45 PM – 7:15 PM'];

const MOCK_ADDRESSES = [
  { id: 'addr-1', tag: 'Home', address: '88 Fifth Avenue, Floor 14', city: 'Nairobi, Kenya' },
  { id: 'addr-2', tag: 'Workspace', address: '422 Artisan Way, Suite 802', city: 'Nairobi, Kenya' },
];

export default function PreOrderView({ onNavigate }: Props) {
  const { cartTotal, promoDiscount, placeOrder, triggerConfetti } = useStore();
  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [scheduledTime, setScheduledTime] = useState(orderType === 'pickup' ? PICKUP_TIMES[0] : DELIVERY_TIMES[0]);
  const [selectedAddressId, setSelectedAddressId] = useState(MOCK_ADDRESSES[0].id);
  const [addressInput, setAddressInput] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState<typeof MOCK_ADDRESSES[0] | null>(null);
  const [mpesaScreenshot, setMpesaScreenshot] = useState<string | null>(null);
  const [mpesaUploading, setMpesaUploading] = useState(false);

  const deliveryFee = orderType === 'delivery' ? 12.00 : 0;
  const grandTotal = cartTotal + deliveryFee - promoDiscount;

  const handlePlaceOrder = async () => {
    if (mpesaUploading) return;
    let finalTime = scheduledTime;
    if (scheduledTime.includes('ASAP')) {
      finalTime = 'ASAP';
    }
    try {
      await placeOrder(orderType, finalTime, mpesaScreenshot || undefined);
      triggerConfetti();
      addToast(
        orderType === 'pickup' ? '🎉 Order placed! Skip the queue.' : '🛵 Order placed! Delivery on the way.',
        'success',
        'check_circle'
      );
      onNavigate('confirm');
    } catch {
      addToast('Failed to place order. Please try again.', 'error', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMpesaUploading(true);
    setMpesaScreenshot(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX = 800;
          if (width > height && width > MAX) {
            height *= MAX / width;
            width = MAX;
          } else if (height > MAX) {
            width *= MAX / height;
            height = MAX;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const blob = await new Promise<Blob | null>(resolve =>
            canvas.toBlob(resolve, 'image/jpeg', 0.7),
          );
          if (!blob) throw new Error('Failed to process image');

          const url = await uploadImage(blob, 'food-joint/mpesa');
          setMpesaScreenshot(url);
          addToast('Payment proof uploaded', 'success', 'check_circle');
        } catch {
          addToast('Failed to upload screenshot. Try again.', 'error', 'error');
        } finally {
          setMpesaUploading(false);
        }
      };
      img.onerror = () => {
        setMpesaUploading(false);
        addToast('Invalid image file', 'error', 'error');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomAddress = () => {
    if (!addressInput.trim()) return;
    const newAddr = {
      id: 'addr-custom',
      tag: 'Other',
      address: addressInput,
      city: 'Nairobi, Kenya'
    };
    setCustomAddress(newAddr);
    setSelectedAddressId(newAddr.id);
    setShowNewAddress(false);
  };

  const activeAddresses = customAddress ? [...MOCK_ADDRESSES, customAddress] : MOCK_ADDRESSES;

  return (
    <main className="preorder-view app-view app-view--inset fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>Scheduling</h1>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Choose your mode & time to bypass the queue</p>
      </div>

      {/* Mode Selector */}
      <div className="glass-panel" style={{ display: 'flex', padding: '6px', borderRadius: 'var(--radius-full)', marginBottom: '24px', border: '1px solid rgba(255, 177, 196, 0.15)' }}>
        <button 
          onClick={() => { setOrderType('pickup'); setScheduledTime(PICKUP_TIMES[0]); }}
          style={{ 
            flex: 1, 
            padding: '12px 0', 
            borderRadius: 'var(--radius-full)', 
            background: orderType === 'pickup' ? 'var(--color-primary-container)' : 'transparent',
            color: orderType === 'pickup' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          🚶 Pickup (Skip Line)
        </button>
        <button 
          onClick={() => { setOrderType('delivery'); setScheduledTime(DELIVERY_TIMES[0]); }}
          style={{ 
            flex: 1, 
            padding: '12px 0', 
            borderRadius: 'var(--radius-full)', 
            background: orderType === 'delivery' ? 'var(--color-primary-container)' : 'transparent',
            color: orderType === 'delivery' ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          🚴 Delivery
        </button>
      </div>

      {/* Address Selection (For Delivery) */}
      {orderType === 'delivery' && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', fontSize: '18px' }}>Delivery Address</h3>
            <button 
              onClick={() => setShowNewAddress(true)}
              className="ripple-btn"
              style={{ color: 'var(--color-tertiary)', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add New
            </button>
          </div>

          {showNewAddress && (
            <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', marginBottom: '16px', border: '1px solid var(--color-tertiary)' }}>
              <input 
                type="text" 
                placeholder="Enter street address & apartment/suite number" 
                value={addressInput} 
                onChange={e => setAddressInput(e.target.value)}
                style={{ width: '100%', background: 'var(--color-surface-container)', border: 'none', borderRadius: 'var(--radius-xl)', padding: '12px', color: '#fff', fontSize: '14px', marginBottom: '12px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNewAddress(false)} style={{ border: 'none', background: 'transparent', color: 'var(--color-on-surface-variant)', padding: '8px 16px' }}>Cancel</button>
                <button onClick={handleAddCustomAddress} style={{ border: 'none', background: 'var(--color-tertiary-fixed)', color: 'var(--color-on-tertiary-fixed)', borderRadius: 'var(--radius-full)', padding: '8px 20px', fontWeight: 'bold' }}>Save</button>
              </div>
            </div>
          )}

          <div className="address-cards scroll-hide">
            {activeAddresses.map(addr => (
              <div 
                key={addr.id} 
                onClick={() => setSelectedAddressId(addr.id)}
                className={`address-card ${selectedAddressId === addr.id ? 'address-card--active' : ''}`}
                style={{ padding: '16px', borderRadius: 'var(--radius-card)', flexShrink: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span className="font-label-md" style={{ color: 'var(--color-tertiary)', fontWeight: 'bold' }}>{addr.tag}</span>
                  {selectedAddressId === addr.id && <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>check_circle</span>}
                </div>
                <p className="font-body-md" style={{ color: 'var(--color-on-surface)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{addr.address}</p>
                <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>{addr.city}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Slot Scheduler */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', fontSize: '18px', marginBottom: '12px' }}>
          {orderType === 'pickup' ? '⏱️ Pick-up Time' : '⏱️ Delivery Window'}
        </h3>
        <div className="time-slot-grid">
          {(orderType === 'pickup' ? PICKUP_TIMES : DELIVERY_TIMES).map(time => (
            <button
              key={time}
              onClick={() => setScheduledTime(time)}
              className="ripple-btn"
              style={{
                padding: '12px 6px',
                borderRadius: 'var(--radius-xl)',
                background: scheduledTime === time ? 'var(--color-primary)' : 'var(--color-surface-container-low)',
                color: scheduledTime === time ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                border: scheduledTime === time ? '1px solid var(--color-primary)' : '1px solid rgba(255, 177, 196, 0.05)',
                fontWeight: 'bold',
                fontSize: '12px',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* M-Pesa Payment Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', fontSize: '18px', marginBottom: '12px' }}>
          M-Pesa Payment (Optional)
        </h3>
        <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', marginBottom: '16px' }}>
          Pay via M-Pesa Till <strong>123456</strong> and attach the screenshot for faster approval.
        </p>
        
        {mpesaUploading ? (
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-card)', textAlign: 'center', border: '1px dashed rgba(255,177,196,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface)', marginTop: '8px' }}>Uploading screenshot…</p>
          </div>
        ) : mpesaScreenshot ? (
          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={mpesaScreenshot} alt="M-Pesa Screenshot" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)' }} />
            <div style={{ flex: 1 }}>
              <p className="font-label-md" style={{ color: 'var(--color-on-surface)' }}>Screenshot Attached</p>
              <button 
                onClick={() => setMpesaScreenshot(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '12px', padding: 0, marginTop: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Remove
              </button>
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '24px' }}>check_circle</span>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-card)', textAlign: 'center', border: '1px dashed rgba(255,177,196,0.3)', cursor: 'pointer', position: 'relative' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary-fixed)' }}>add_photo_alternate</span>
            <p className="font-label-md" style={{ color: 'var(--color-on-surface)', marginTop: '8px' }}>Tap to upload screenshot</p>
          </div>
        )}
      </div>

      {/* Order Summary & Pay */}
      <div className="cart-summary" style={{ background: 'var(--color-primary-container)', borderRadius: 'var(--radius-card)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="font-label-md" style={{ color: 'var(--color-on-primary-container)' }}>Items Subtotal</span>
          <span className="font-price-display" style={{ color: 'var(--color-on-surface)' }}>${cartTotal.toFixed(2)}</span>
        </div>
        {promoDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-tertiary)' }}>Promo Discount</span>
            <span className="font-price-display" style={{ color: 'var(--color-tertiary)' }}>−${promoDiscount.toFixed(2)}</span>
          </div>
        )}
        {orderType === 'delivery' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255, 177, 196, 0.1)', paddingBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-primary-container)' }}>Delivery Fee</span>
            <span className="font-price-display" style={{ color: 'var(--color-on-surface)' }}>${deliveryFee.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 20px 0' }}>
          <span className="font-label-md" style={{ color: 'var(--color-primary-fixed)', textTransform: 'uppercase', fontWeight: 'bold' }}>Grand Total</span>
          <span className="font-price-display" style={{ color: 'var(--color-on-surface)', fontSize: '24px' }}>${grandTotal.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={mpesaUploading}
          className="cart-checkout-btn ripple-btn"
          style={{ width: '100%', padding: '16px', opacity: mpesaUploading ? 0.6 : 1 }}
        >
          <span className="font-label-md" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.15em' }}>Confirm & Place Order</span>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span>
        </button>
      </div>
    </main>
  );
}
