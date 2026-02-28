const NebulaBackground = () => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none',
    background: [
      'radial-gradient(ellipse 50% 40% at 15% 25%, rgba(123,47,255,0.10), transparent)',
      'radial-gradient(ellipse 40% 50% at 85% 75%, rgba(0,212,255,0.07), transparent)',
      'radial-gradient(ellipse 35% 25% at 75% 15%, rgba(255,107,53,0.06), transparent)',
    ].join(', '),
  }} />
);

export default NebulaBackground;
