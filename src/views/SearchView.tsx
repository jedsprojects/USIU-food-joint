import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product, CustomerView } from '../context/StoreContext';

interface Props {
  onNavigate: (view: CustomerView, product?: Product) => void;
}

export default function SearchView({ onNavigate }: Props) {
  const { products, addToCart } = useStore();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(30);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.subtitle.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= maxPrice;
      const matchesAvailability = !onlyAvailable || product.available;
      
      return matchesQuery && matchesCategory && matchesPrice && matchesAvailability;
    });
  }, [products, query, selectedCategory, maxPrice, onlyAvailable]);

  return (
    <main className="search-view app-view app-view--inset fade-in-up">
      <div className="search-header" style={{ marginBottom: '20px' }}>
        <h1 className="font-headline-lg-mobile" style={{ color: 'var(--color-on-surface)' }}>Discover</h1>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Find your next craving</p>
      </div>

      {/* Search Input */}
      <div className="search-input-wrap glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-xl)', marginBottom: '24px', border: '1px solid rgba(255, 177, 196, 0.15)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-on-surface-variant)', marginRight: '12px' }}>search</span>
        <input 
          type="text" 
          placeholder="Search burgers, desserts, drinks..." 
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-on-surface)', fontSize: '16px' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'transparent', border: 'none', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        )}
      </div>

      {/* Filters Sheet / Panel */}
      <div className="filters-panel glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-card)', marginBottom: '24px', border: '1px solid rgba(255, 177, 196, 0.1)' }}>
        <h3 className="font-label-md" style={{ color: 'var(--color-primary-fixed-dim)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter & Customise</h3>
        
        {/* Categories */}
        <div style={{ marginBottom: '16px' }}>
          <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Category</p>
          <div className="category-scroll scroll-hide" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-chip ${selectedCategory === cat ? 'category-chip--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Max Price</span>
            <span className="font-price-display" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '14px' }}>${maxPrice}</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="30" 
            step="1"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>

        {/* Available toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>In Stock Only</span>
          <button 
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className="ripple-btn"
            style={{ 
              width: '44px', 
              height: '24px', 
              borderRadius: 'var(--radius-full)', 
              background: onlyAvailable ? 'var(--color-primary)' : 'var(--color-surface-container-highest)', 
              position: 'relative',
              transition: 'background 0.3s ease',
              border: 'none'
            }}
          >
            <div style={{ 
              width: '18px', 
              height: '18px', 
              borderRadius: '50%', 
              background: '#fff', 
              position: 'absolute', 
              top: '3px', 
              left: onlyAvailable ? '23px' : '3px', 
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }} />
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)' }}>Results</h3>
        <span className="font-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>{filteredProducts.length} items found</span>
      </div>

      {/* Results Grid */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => onNavigate('detail', product)} role="button" tabIndex={0}>
              <div className="product-card__img-wrap">
                <img className="product-card__img" src={product.image} alt={product.name} loading="lazy" />
                {!product.available && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="badge badge--ghost" style={{ background: 'var(--color-error)', color: '#fff' }}>Sold Out</span>
                  </div>
                )}
                {product.isDrop && <span className="product-card__drop-badge">🔥</span>}
              </div>
              <div className="product-card__body">
                <h5 className="font-label-md product-card__name" style={{ color: 'var(--color-on-surface)' }}>{product.name}</h5>
                <div className="product-card__footer">
                  <span className="font-price-display" style={{ fontSize: '18px', color: 'var(--color-on-surface)' }}>${product.price.toFixed(2)}</span>
                  {product.available && (
                    <button className="product-card__add-btn ripple-btn" onClick={e => { e.stopPropagation(); addToCart(product); }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-card)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-on-surface-variant)', opacity: 0.4 }}>search_off</span>
          <p className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginTop: '16px' }}>No matches found</p>
          <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '8px' }}>Try broadening your keywords or resetting filters.</p>
        </div>
      )}
    </main>
  );
}
