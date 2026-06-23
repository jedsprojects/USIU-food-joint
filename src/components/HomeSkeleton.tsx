export default function HomeSkeleton() {
  return (
    <main className="home-view app-view fade-in-up">
      <div className="skeleton-block skeleton-block--loyalty" />

      <section className="home-view__greeting">
        <div className="skeleton-block skeleton-block--line skeleton-block--line-sm" />
        <div className="skeleton-block skeleton-block--line skeleton-block--line-lg" />
        <div className="skeleton-block skeleton-block--line skeleton-block--line-md" />
      </section>

      <section className="category-chips scroll-hide" style={{ display: 'flex', gap: '8px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-block skeleton-block--chip" />
        ))}
      </section>

      <section className="home-view__section" style={{ marginTop: '24px' }}>
        <div className="skeleton-block skeleton-block--line skeleton-block--line-md" style={{ marginBottom: '12px' }} />
        <div className="skeleton-block skeleton-block--hero" />
      </section>

      <section className="home-view__section">
        <div className="skeleton-block skeleton-block--line skeleton-block--line-md" style={{ marginBottom: 'var(--space-md)' }} />
        <div className="product-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-block skeleton-block--card" />
          ))}
        </div>
      </section>
    </main>
  );
}
