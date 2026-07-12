/**
 * AmbientOrbs — purely decorative CSS-animated glowing orbs
 * in the page background, giving the app depth and luxury feel.
 * Eye-comfort version: reduced opacity, warmer hues, gentler blur.
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
      {/* Top-left hot orange orb — brand anchor */}
      <div style={{
        position: 'absolute',
        top: '-140px',
        left: '-100px',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(226,70,10,0.2) 0%, rgba(226,70,10,0.05) 45%, transparent 72%)',
        animation: 'orb-drift-1 20s ease-in-out infinite',
        filter: 'blur(50px)',
      }} />

      {/* Bottom-right warm fire gold orb — gentle accent */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        right: '-120px',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,193,7,0.08) 0%, rgba(255,193,7,0.02) 50%, transparent 72%)',
        animation: 'orb-drift-2 26s ease-in-out infinite',
        filter: 'blur(60px)',
      }} />

      {/* Center atmospheric fire wash — mid-layer depth */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(226,50,0,0.05) 0%, transparent 68%)',
        animation: 'orb-drift-3 30s ease-in-out infinite',
        filter: 'blur(70px)',
      }} />

      {/* Bottom-left hot red orb — grounding anchor */}
      <div style={{
        position: 'absolute',
        bottom: '-80px',
        left: '-60px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,30,0,0.1) 0%, transparent 70%)',
        animation: 'orb-drift-2 24s ease-in-out infinite reverse',
        filter: 'blur(60px)',
      }} />
    </div>
  );
}
