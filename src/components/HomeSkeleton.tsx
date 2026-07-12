export default function HomeSkeleton() {
  return (
    <main className="home-view app-view fade-in-up">
      <section className="home-hero stagger-children" aria-hidden="true">
        <div className="skeleton-block skeleton-block--loyalty" />

        <section className="home-hero__greeting">
          <div className="skeleton-block skeleton-block--line skeleton-block--line-sm" />
          <div className="skeleton-block skeleton-block--line skeleton-block--line-lg" />
          <div className="skeleton-block skeleton-block--line skeleton-block--line-md" />
        </section>

        <div className="home-hero__promos">
          <section className="home-hero__categories category-chips scroll-hide">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-block skeleton-block--chip" />
            ))}
          </section>

          <div className="home-featured-stack">
            <section className="home-view__section home-view__section--drops">
              <div className="skeleton-block skeleton-block--line skeleton-block--line-md" style={{ marginBottom: '12px' }} />
              <div className="skeleton-block skeleton-block--hero">
                <div className="skeleton-block skeleton-block--hero-panel" />
              </div>
            </section>

            <section className="home-view__section home-view__section--hero">
              <div className="skeleton-block skeleton-block--line skeleton-block--line-md" style={{ marginBottom: '12px' }} />
              <div className="skeleton-block skeleton-block--hero">
                <div className="skeleton-block skeleton-block--hero-panel" />
              </div>
            </section>
          </div>
        </div>
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
