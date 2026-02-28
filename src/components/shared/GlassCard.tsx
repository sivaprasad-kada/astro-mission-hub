import { useState, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  accentColor?: string;
  glowOnHover?: boolean;
  style?: React.CSSProperties;
}

const GlassCard = ({ children, accentColor, glowOnHover = true, style }: Props) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(10,15,50,0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${accentColor ? `${accentColor}33` : 'rgba(0,212,255,0.15)'}`,
        borderRadius: 12,
        boxShadow: hovered && glowOnHover && accentColor
          ? `0 8px 32px rgba(0,0,0,0.4), 0 0 30px ${accentColor}22`
          : '0 8px 32px rgba(0,0,0,0.4)',
        padding: 24,
        transition: 'all 0.3s ease',
        borderTop: accentColor ? `2px solid ${accentColor}` : undefined,
        transform: hovered && glowOnHover ? 'translateY(-2px)' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
