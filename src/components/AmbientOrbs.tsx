/**
 * AmbientOrbs — purely decorative CSS-animated glowing orbs
 * in the page background, giving the app depth and luxury feel.
 */
export default function AmbientOrbs() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Top-left deep crimson orb */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '-80px',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,13,51,0.5) 0%, transparent 70%)',
        animation: 'orb-drift-1 18s ease-in-out infinite',
        filter: 'blur(40px)',
      }} />

      {/* Bottom-right gold orb */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        right: '-100px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(233,195,73,0.18) 0%, transparent 70%)',
        animation: 'orb-drift-2 22s ease-in-out infinite',
        filter: 'blur(50px)',
      }} />

      {/* Center accent orb */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(130,33,68,0.12) 0%, transparent 70%)',
        animation: 'orb-drift-3 26s ease-in-out infinite',
        filter: 'blur(60px)',
      }} />
    </div>
  );
}
