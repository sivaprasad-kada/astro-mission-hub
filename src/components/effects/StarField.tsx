import { useEffect, useRef } from 'react';

const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 2,
      baseOpacity: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.5 + Math.random() * 2,
      driftSpeed: 0.05 + Math.random() * 0.25,
      color: Math.random() < 0.7 ? '#fff' : Math.random() < 0.67 ? 'rgba(0,212,255,1)' : 'rgba(255,215,0,1)',
      phase: Math.random() * Math.PI * 2,
    }));

    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y += s.driftSpeed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        const opacity = s.baseOpacity * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase));
        ctx.globalAlpha = opacity;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
};

export default StarField;
