import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('button, a, [role="button"], input, textarea, select, label')) setHovering(true);
    };
    const onOut = () => setHovering(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onOut);

    let frame: number;
    const animate = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.12;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x - 5}px, ${mouse.current.y - 5}px)`;
      }
      if (ringRef.current) {
        const size = hovering ? 50 : 34;
        ringRef.current.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
        ringRef.current.style.width = `${size}px`;
        ringRef.current.style.height = `${size}px`;
        ringRef.current.style.borderColor = hovering ? 'var(--accent-orange)' : 'var(--accent-blue)';
      }
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(frame); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseover', onOver); window.removeEventListener('mouseout', onOut); };
  }, [hovering]);

  const baseStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999, willChange: 'transform' };

  return (
    <>
      <div ref={dotRef} style={{ ...baseStyle, width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-blue)' }} />
      <div ref={ringRef} style={{ ...baseStyle, width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--accent-blue)', transition: 'width 0.2s, height 0.2s, border-color 0.2s' }} />
    </>
  );
};

export default CustomCursor;
