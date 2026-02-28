import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const colorMap: Record<string, string> = {
  blue: 'var(--accent-blue)',
  orange: 'var(--accent-orange)',
  green: 'var(--accent-green)',
  gold: 'var(--accent-gold)',
  purple: 'var(--accent-purple)',
  red: 'var(--accent-red)',
};

const sizeMap: Record<string, { padding: string; fontSize: string }> = {
  sm: { padding: '8px 18px', fontSize: '13px' },
  md: { padding: '12px 28px', fontSize: '15px' },
  lg: { padding: '16px 38px', fontSize: '17px' },
};

interface Props {
  label: string;
  color?: string;
  size?: string;
  onClick?: () => void;
  href?: string;
  ghost?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const GlowButton = ({ label, color = 'blue', size = 'md', onClick, href, ghost, fullWidth, style }: Props) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const c = colorMap[color] || color;
  const s = sizeMap[size] || sizeMap.md;

  const handleClick = () => {
    if (href) navigate(href);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 600,
        color: ghost ? '#fff' : c,
        background: ghost
          ? (hovered ? 'rgba(255,255,255,0.08)' : 'transparent')
          : (hovered ? `${c}33` : 'rgba(5,10,30,0.6)'),
        border: `1px solid ${ghost ? 'rgba(255,255,255,0.3)' : c}`,
        borderRadius: 8,
        boxShadow: hovered ? `0 0 20px ${c}44, 0 0 40px ${c}22` : `0 0 10px ${c}22`,
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.2s ease',
        letterSpacing: '0.5px',
        width: fullWidth ? '100%' : undefined,
        textAlign: fullWidth ? 'left' as const : undefined,
        ...style,
      }}
    >
      {label}
    </button>
  );
};

export default GlowButton;
