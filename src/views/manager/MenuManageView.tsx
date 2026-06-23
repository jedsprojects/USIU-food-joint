import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Product } from '../../context/StoreContext';
import { uploadImage } from '../../utils/cloudinary';
import { addToast } from '../../utils/toast';

const DEFAULT_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgYtfrcdT6SlneXTT8B3Nfb2vm0aMSgjRggQ9z9tVsSTqMtC9CQH2zorPhTkRhwrGyQwsl7s0eutnhyWf3s_urSJdxObQeXpPb0d04exdPyBS9akbRHl6W4Iui7Sld9KrG1_DD2we5e1zcEpljbwsnNiab3sXEO-hd88ojh5JRHkuIaJmWVngBDA-NL_LQVNHmN6_hwebVcjGgJ4VxeuWUW9QR0kLSKH0fdyFwATD19v5Mlt56gWB6ht597nNE1KCaoUi6smY0G3UP';

export default function MenuManageView() {
  const { products, addProduct, updateProduct, deleteProduct, toggleAvailability } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('10');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState('Burgers');
  const [badge, setBadge] = useState('');
  const [isDrop, setIsDrop] = useState(false);
  const [calories] = useState('400');
  const [prepTime, setPrepTime] = useState('10 mins');

  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setName('');
    setSubtitle('');
    setPrice('10');
    setImageFile(null);
    setImagePreview(null);
    setBadge('');
    setIsDrop(false);
    setShowAddForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setUploading(true);
    try {
      let imageUrl = DEFAULT_IMAGE;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'food-joint/products');
      }

      await addProduct({
        name,
        subtitle,
        price: parseFloat(price),
        image: imageUrl,
        category,
        badge: badge || undefined,
        available: true,
        isDrop,
        calories: parseInt(calories) || undefined,
        prepTime,
      });

      addToast(`${name} published`, 'success', 'restaurant_menu');
      resetForm();
    } catch {
      addToast('Failed to upload image. Try again.', 'error', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setUploading(true);
    try {
      const updates: Partial<Product> = {
        name: editingProduct.name,
        price: editingProduct.price,
        subtitle: editingProduct.subtitle,
        category: editingProduct.category,
        badge: editingProduct.badge,
      };

      if (editImageFile) {
        updates.image = await uploadImage(editImageFile, 'food-joint/products');
      }

      await updateProduct(editingProduct.id, updates);
      addToast('Item updated', 'success', 'check');
      setEditingProduct(null);
      setEditImageFile(null);
    } catch {
      addToast('Failed to update image. Try again.', 'error', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 className="font-headline-md" style={{ color: '#fff' }}>Menu Customiser</h2>
          <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Modify items, availability, and drops</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="ripple-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--color-tertiary-fixed)',
            color: 'var(--color-on-tertiary-fixed)',
            borderRadius: 'var(--radius-full)',
            padding: '10px 16px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add Item
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-primary)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="font-headline-md" style={{ color: '#fff' }}>Create Menu Item</h3>
            <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Item Name (e.g. Velvet Burger)" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            <input type="text" placeholder="Subtitle description" value={subtitle} onChange={e => setSubtitle(e.target.value)} style={{ width: '100%', background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" step="0.01" placeholder="Price ($)" value={price} onChange={e => setPrice(e.target.value)} required style={{ flex: 1, background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                <option value="Burgers">Burgers</option>
                <option value="Sides">Sides</option>
                <option value="Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '8px', border: '1px dashed rgba(255,177,196,0.3)', position: 'relative', textAlign: 'center' }}>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--color-primary-fixed)' }}>add_photo_alternate</span>
                  <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '6px' }}>Tap to upload photo (optional)</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Badge (e.g. Bestseller)" value={badge} onChange={e => setBadge(e.target.value)} style={{ flex: 1, background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              <input type="text" placeholder="Prep Time (e.g. 10 mins)" value={prepTime} onChange={e => setPrepTime(e.target.value)} style={{ flex: 1, background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px' }}>
              <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Make this a Secret Drop?</span>
              <input type="checkbox" checked={isDrop} onChange={e => setIsDrop(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
            </div>
            <button type="submit" disabled={uploading} className="cart-checkout-btn ripple-btn" style={{ width: '100%', padding: '12px', opacity: uploading ? 0.6 : 1 }}>
              {uploading ? 'Uploading…' : 'Publish Item'}
            </button>
          </form>
        </div>
      )}

      {editingProduct && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-tertiary)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="font-headline-md" style={{ color: '#fff' }}>Edit {editingProduct.name}</h3>
            <button onClick={() => { setEditingProduct(null); setEditImageFile(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} required style={{ width: '100%', background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            <input type="text" value={editingProduct.subtitle} onChange={e => setEditingProduct({ ...editingProduct, subtitle: e.target.value })} style={{ width: '100%', background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} required style={{ flex: 1, background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              <select value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} style={{ flex: 1, background: 'var(--color-surface-container)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                <option value="Burgers">Burgers</option>
                <option value="Sides">Sides</option>
                <option value="Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
            <div className="glass-panel" style={{ padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,177,196,0.3)', position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={editingProduct.image} alt="" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
              <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] ?? null)} style={{ flex: 1, color: 'var(--color-on-surface-variant)', fontSize: '13px' }} />
            </div>
            <button type="submit" disabled={uploading} className="cart-checkout-btn ripple-btn" style={{ width: '100%', padding: '12px', background: 'var(--color-tertiary-fixed)', color: 'var(--color-on-tertiary-fixed)', opacity: uploading ? 0.6 : 1 }}>
              {uploading ? 'Uploading…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {products.map(product => (
          <div key={product.id} className="glass-panel" style={{
            display: 'flex',
            padding: '12px',
            borderRadius: 'var(--radius-card)',
            alignItems: 'center',
            gap: '16px',
            border: '1px solid rgba(255, 177, 196, 0.1)',
            opacity: product.available ? 1 : 0.6,
          }}>
            <img src={product.image} alt={product.name} style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-xl)', objectFit: 'cover' }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 className="font-headline-md" style={{ fontSize: '15px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                <span className="badge badge--ghost" style={{ fontSize: '8px', padding: '2px 6px' }}>{product.category}</span>
              </div>
              <p className="font-price-display" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '14px', marginTop: '2px' }}>${product.price.toFixed(2)}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => toggleAvailability(product.id)}
                className="ripple-btn"
                style={{
                  width: '38px',
                  height: '20px',
                  borderRadius: 'var(--radius-full)',
                  background: product.available ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                  position: 'relative',
                  border: 'none',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '3px',
                  left: product.available ? '21px' : '3px',
                  transition: 'left 0.2s',
                }} />
              </button>

              <button onClick={() => setEditingProduct(product)} style={{ background: 'transparent', border: 'none', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
              </button>

              <button onClick={() => deleteProduct(product.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
