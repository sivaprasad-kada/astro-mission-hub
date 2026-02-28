import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GlowButton from '../components/shared/GlowButton';
import GlassCard from '../components/shared/GlassCard';

// ─── CONTINUOUS FIRE PARTICLES ───
interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  yTarget: number;
}

const ContinuousFire = ({ active, intensity = 'normal' }: { active: boolean; intensity?: 'low' | 'normal' | 'high' }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  const config = {
    low: { interval: 150, count: 3, spread: 20, maxParticles: 30 },
    normal: { interval: 80, count: 5, spread: 40, maxParticles: 60 },
    high: { interval: 50, count: 8, spread: 55, maxParticles: 100 },
  }[intensity];

  useEffect(() => {
    if (!active) {
      setParticles([]);
      idRef.current = 0;
      return;
    }

    const colors = ['#ff6b35', '#ff3366', '#ffaa00', '#ff8800', '#ff4444', '#ffcc00'];

    const spawnBatch = () => {
      const batch: Particle[] = [];
      for (let j = 0; j < config.count; j++) {
        batch.push({
          id: idRef.current++,
          x: (Math.random() - 0.5) * config.spread,
          size: 2 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: 0.3 + Math.random() * 0.5,
          yTarget: 30 + Math.random() * 70,
        });
      }
      setParticles(prev => [...prev.slice(-(config.maxParticles - config.count)), ...batch]);
    };

    spawnBatch();
    const interval = setInterval(spawnBatch, config.interval);
    return () => clearInterval(interval);
  }, [active, intensity]);

  return (
    <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 0, height: 0, pointerEvents: 'none' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.9, y: 0, x: 0, scale: 1 }}
          animate={{ opacity: 0, y: p.yTarget, x: p.x, scale: 0.2 }}
          transition={{ duration: p.duration, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: -p.size / 2,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size + 2}px ${p.color}`,
          }}
        />
      ))}
      {/* Central flame glow */}
      {active && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: -4,
            left: -12,
            width: 24,
            height: 30,
            borderRadius: '50% 50% 40% 40%',
            background: 'radial-gradient(ellipse, rgba(255,170,0,0.6), rgba(255,68,68,0.3), transparent)',
            filter: 'blur(3px)',
          }}
        />
      )}
    </div>
  );
};

// ─── HERO SECTION ───
const HeroSection = () => {
  const navigate = useNavigate();
  const title1 = "UNDERSTAND SPACE.";
  const title2 = "ASK ANYTHING.";
  const rocketControls = useAnimation();
  const floatControls = useAnimation();
  const [launching, setLaunching] = useState(false);
  const [fireStage, setFireStage] = useState<'off' | 'ignite' | 'full'>('off');

  // Start floating animation
  useEffect(() => {
    if (!launching) {
      floatControls.start({
        y: [0, -12, 0],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      });
    }
  }, [launching, floatControls]);

  const handleLaunch = useCallback(async () => {
    if (launching) return;
    setLaunching(true);

    // Stop floating
    floatControls.stop();
    floatControls.set({ y: 0 });

    // Phase 1: Ignition — fire starts small
    setFireStage('ignite');

    // Phase 2: Shake + fire builds
    await rocketControls.start({
      x: [0, -4, 4, -3, 3, -2, 2, -1, 1, 0],
      transition: { duration: 0.8 },
    });

    // Phase 3: Full thrust
    setFireStage('full');
    await new Promise(r => setTimeout(r, 300));

    // Phase 4: Launch upward
    await rocketControls.start({
      y: -window.innerHeight - 300,
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
    });

    navigate('/chat');
  }, [launching, rocketControls, floatControls, navigate]);

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 40px', position: 'relative', zIndex: 2, overflow: 'hidden',
    }}>
      {/* Left orbital ring */}
      <div style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}>
        <motion.svg width="260" height="260" viewBox="0 0 300 300" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
          <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="150" cy="10" r="3" fill="var(--accent-blue)" opacity="0.5" />
        </motion.svg>
      </div>

      {/* Background rocket — centered behind text */}
      <motion.div
        animate={floatControls}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -190,
          marginLeft: -90,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <motion.div animate={rocketControls} style={{ position: 'relative' }}>
          <svg width="180" height="380" viewBox="0 0 180 380" style={{ opacity: 0.10, filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.2))' }}>
            {/* Rocket body */}
            <path d="M90 8 L125 100 L125 260 L110 305 L90 320 L70 305 L55 260 L55 100 Z"
              fill="rgba(0,212,255,0.03)" stroke="var(--accent-blue)" strokeWidth="1.5" />
            {/* Left fin */}
            <path d="M55 220 L25 290 L55 265" fill="rgba(255,107,53,0.05)" stroke="var(--accent-orange)" strokeWidth="1.5" />
            {/* Right fin */}
            <path d="M125 220 L155 290 L125 265" fill="rgba(255,107,53,0.05)" stroke="var(--accent-orange)" strokeWidth="1.5" />
            {/* Window */}
            <circle cx="90" cy="145" r="18" fill="none" stroke="var(--accent-blue)" strokeWidth="1" />
            <circle cx="90" cy="145" r="10" fill="rgba(0,212,255,0.05)" stroke="var(--accent-blue)" strokeWidth="0.5" />
            {/* Detail lines */}
            <line x1="55" y1="175" x2="125" y2="175" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" />
            <line x1="55" y1="230" x2="125" y2="230" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" />
          </svg>

          {/* Idle exhaust — subtle */}
          {!launching && [...Array(5)].map((_, i) => (
            <motion.div key={`idle-${i}`}
              animate={{ y: [0, 35 + i * 6], opacity: [0.4, 0], scale: [1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute', bottom: 0,
                left: `calc(50% + ${(i - 2) * 7}px)`,
                width: 3, height: 3, borderRadius: '50%',
                background: 'var(--accent-orange)',
                boxShadow: '0 0 4px var(--accent-orange)',
              }}
            />
          ))}

          {/* Launch fire — continuous particles */}
          <ContinuousFire
            active={fireStage !== 'off'}
            intensity={fireStage === 'full' ? 'high' : 'normal'}
          />
        </motion.div>
      </motion.div>

      {/* Center text content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            display: 'inline-block', fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
            color: 'var(--accent-blue)', border: '1px solid rgba(0,212,255,0.25)',
            background: 'rgba(0,212,255,0.05)', borderRadius: 20, padding: '6px 16px',
            marginBottom: 28, letterSpacing: 1,
          }}
        >
          🛸 RAG POWERED • GEMINI FLASH • ISRO DOCUMENTS
        </motion.div>

        <div>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 68,
            lineHeight: 1.08, margin: 0, color: '#fff',
            textShadow: '0 0 30px rgba(0,212,255,0.3)',
          }}>
            {title1.split('').map((ch, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.04 }}>
                {ch}
              </motion.span>
            ))}
          </h1>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 68,
            lineHeight: 1.08, margin: '6px 0 0', color: 'var(--accent-blue)',
          }}>
            {title2.split('').map((ch, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 + i * 0.04 }}>
                {ch}
              </motion.span>
            ))}
          </h1>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{
            fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: 'var(--text-secondary)',
            maxWidth: 500, margin: '20px auto 28px', lineHeight: 1.6,
          }}
        >
          India's first AI bot trained on official ISRO documents. Ask about Chandrayaan, Gaganyaan, launch sequences, and more.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 20 }}
        >
          <button
            onClick={handleLaunch}
            style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 16,
              padding: '14px 32px', color: '#fff', letterSpacing: 0.5,
              background: 'linear-gradient(135deg, rgba(0,180,220,0.2), rgba(0,130,200,0.15))',
              border: '1px solid rgba(0,212,255,0.4)',
              borderRadius: 10, cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: '0 0 12px rgba(0,212,255,0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,180,220,0.35), rgba(0,130,200,0.25))';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,180,220,0.2), rgba(0,130,200,0.15))';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(0,212,255,0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🚀 Launch ASTRO
          </button>
          <button
            style={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 16,
              padding: '14px 32px', color: 'rgba(255,255,255,0.7)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            Watch Demo
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}
          style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: 'var(--accent-green)', opacity: 0.8 }}
        >
          SYSTEM READY • ALL DOCUMENTS INDEXED • AWAITING QUERY<span style={{ animation: 'blink 1s infinite' }}>_</span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: 36, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          zIndex: 1,
        }}
      >
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: 'var(--text-dim)', letterSpacing: 2, opacity: 0.6 }}>
          SCROLL TO EXPLORE MISSION
        </div>
        <svg width="16" height="16" viewBox="0 0 20 20" style={{ marginTop: 6, opacity: 0.5 }}>
          <path d="M5 8 L10 14 L15 8" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" />
        </svg>
      </motion.div>
    </section>
  );
};

// ─── SCROLL-TO-TOP ROCKET BUTTON ───
const ScrollToTopRocket = () => {
  const [visible, setVisible] = useState(false);
  const [firing, setFiring] = useState(false);
  const rocketBtnControls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    // Shake
    await rocketBtnControls.start({
      x: [0, -2, 2, -1, 1, 0],
      transition: { duration: 0.25 },
    });

    // Launch up
    rocketBtnControls.start({
      y: -window.innerHeight,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset after animation
    setTimeout(() => {
      rocketBtnControls.set({ y: 60 });
      setTimeout(() => {
        rocketBtnControls.start({ y: 0, transition: { duration: 0.35, ease: 'easeOut' } });
        setFiring(false);
      }, 500);
    }, 600);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 999,
          }}
        >
          <motion.button
            animate={rocketBtnControls}
            onClick={handleClick}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              border: '1px solid rgba(0,212,255,0.25)',
              background: 'rgba(5,10,30,0.85)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'visible',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              if (!firing) {
                e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)';
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,212,255,0.15)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
            }}
          >
            {/* Rocket icon */}
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M14 3 L18 10 L18 19 L16 22 L14 24 L12 22 L10 19 L10 10 Z"
                stroke="var(--accent-blue)" strokeWidth="1.5" fill="rgba(0,212,255,0.08)" />
              <path d="M10 16 L7 21 L10 19" stroke="var(--accent-orange)" strokeWidth="1.2" fill="none" />
              <path d="M18 16 L21 21 L18 19" stroke="var(--accent-orange)" strokeWidth="1.2" fill="none" />
              <circle cx="14" cy="12" r="2" stroke="var(--accent-blue)" strokeWidth="0.8" fill="rgba(0,212,255,0.1)" />
            </svg>

            {/* Fire when launching */}
            {firing && (
              <div style={{ position: 'absolute', bottom: -6, left: '50%' }}>
                <ContinuousFire active={true} intensity="low" />
              </div>
            )}
          </motion.button>

          {/* Label */}
          {!firing && (
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 8,
              color: 'rgba(0,212,255,0.5)',
              textAlign: 'center',
              marginTop: 4,
              letterSpacing: 1,
            }}>
              TOP
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── ANIMATED SECTION WRAPPER ───
const AnimatedSection = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
      style={{ position: 'relative', zIndex: 2, padding: '100px 60px', ...style }}
    >
      {children}
    </motion.section>
  );
};

const SectionLabel = ({ text, color = 'var(--accent-orange)' }: { text: string; color?: string }) => (
  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color, letterSpacing: 4, textAlign: 'center', marginBottom: 20 }}>{text}</div>
);

const SectionTitle = ({ text }: { text: string }) => (
  <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 40, textAlign: 'center', marginBottom: 48, color: 'var(--text-primary)' }}>{text}</h2>
);


// ─── SOLUTION SECTION ───
const SolutionSection = () => (
  <AnimatedSection style={{ background: 'radial-gradient(ellipse at center, rgba(0,50,100,0.15), var(--bg-deep))' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, maxWidth: 1100, margin: '0 auto', alignItems: 'center' }}>
      {/* Chat mockup */}
      <motion.div initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}
        style={{ background: 'rgba(5,10,35,0.9)', border: '1px solid var(--accent-blue)', borderRadius: 16, padding: 24, boxShadow: '0 0 60px rgba(0,212,255,0.15)', animation: 'float 4s ease-in-out infinite' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: 'var(--accent-blue)' }}>ASTRO</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '16px 16px 4px 16px', padding: '12px 18px', maxWidth: '80%', fontSize: 14 }}>
            Explain rocket launch sequence 🧑‍🚀
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🚀</span>
          <div>
            <div style={{ background: 'rgba(5,10,30,0.8)', borderLeft: '3px solid var(--accent-blue)', borderRadius: '0 12px 12px 12px', padding: '14px 18px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              A rocket launch follows 5 key stages: Pre-launch checks, Ignition sequence, Liftoff, Stage separation, and Payload deployment...
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: 'var(--accent-blue)', marginTop: 8, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, padding: '4px 12px', display: 'inline-block' }}>
              📄 ISRO Gaganyaan Doc • Page 14
            </div>
          </div>
        </div>
      </motion.div>

      {/* Text */}
      <motion.div initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
        <SectionLabel text="THE SOLUTION" color="var(--accent-blue)" />
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 44, marginBottom: 24 }}>Meet ASTRO</h2>
        {['Retrieves answers from official ISRO & NASA documents', 'Cites exact page numbers and sources', 'Explains complex concepts in simple language'].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, fontSize: 17, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-blue)' }}>✅</span> {t}
          </div>
        ))}
        <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, margin: '28px 0', color: '#fff', lineHeight: 1.5 }}>
          Not AI guesswork.<br />Real document intelligence.
        </p>
        <GlowButton label="Explore Features →" color="blue" />
      </motion.div>
    </div>
  </AnimatedSection>
);

// ─── FEATURES GRID ───
const FeaturesSection = () => {
  const features = [
    { emoji: '🔵', title: 'RAG Powered', desc: 'Retrieves answers from real ISRO and NASA documents using vector similarity search.', color: 'var(--accent-blue)' },
    { emoji: '🟠', title: 'Source Verified', desc: 'Every answer cites exact document names and page numbers for verification.', color: 'var(--accent-orange)' },
    { emoji: '🟢', title: 'Zero Hallucination', desc: 'Strictly grounded in official documents — no speculation or made-up facts.', color: 'var(--accent-green)' },
    { emoji: '🟣', title: 'ISRO Focused', desc: 'Deep knowledge of Chandrayaan, Mangalyaan, Gaganyaan, and more missions.', color: 'var(--accent-purple)' },
    { emoji: '⚡', title: 'Gemini Flash', desc: 'Lightning fast responses under 2 seconds powered by Google Gemini Flash.', color: 'var(--accent-gold)' },
    { emoji: '🎓', title: 'Education Only', desc: 'Designed to explain and educate — perfect for students and enthusiasts.', color: 'var(--accent-red)' },
  ];

  return (
    <AnimatedSection>
      <SectionTitle text="Mission Capabilities" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
            <GlassCard accentColor={f.color}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.emoji}</div>
              <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
};

// ─── MISSIONS SECTION ───
const MissionsSection = () => {
  const missions = [
    { name: 'Chandrayaan-3', initials: 'C3', type: 'LUNAR SOUTH POLE', date: 'AUG 23 2023', status: 'SUCCESS ✓', statusColor: 'var(--accent-green)', color: 'var(--accent-gold)' },
    { name: 'Mangalyaan', initials: 'MOM', type: 'MARS ORBITER', date: 'SEP 24 2014', status: 'SUCCESS ✓', statusColor: 'var(--accent-green)', color: 'var(--accent-orange)' },
    { name: 'Gaganyaan', initials: 'GY', type: 'HUMAN SPACEFLIGHT', date: '2025', status: 'UPCOMING', statusColor: 'var(--accent-blue)', color: 'var(--accent-blue)' },
    { name: 'Aditya L1', initials: 'A1', type: 'SOLAR OBSERVATION', date: '2023', status: 'ACTIVE', statusColor: 'var(--accent-blue)', color: '#ffdd44' },
  ];

  return (
    <AnimatedSection style={{ background: '#000008' }}>
      <SectionTitle text="Built for Bharat's Space Journey 🇮🇳" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
        {missions.map((m, i) => (
          <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}>
            <GlassCard accentColor={m.color}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: m.color, marginBottom: 16 }}>
                {m.initials}
              </div>
              <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, marginBottom: 4 }}>{m.name}</h3>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 4 }}>{m.type}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>{m.date}</div>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: m.statusColor, background: `${m.statusColor}15`, border: `1px solid ${m.statusColor}33`, borderRadius: 12, padding: '3px 10px' }}>
                {m.status}
              </span>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      <p style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 20, color: 'var(--text-secondary)', marginTop: 48, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
        India reached the Moon's south pole. Now every student can understand how.
      </p>
    </AnimatedSection>
  );
};

// ─── DEMO SECTION ───
const DemoSection = () => {
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [displayText, setDisplayText] = useState('');
  const navigate = useNavigate();

  const questions = [
    { q: '🚀 How does a rocket launch work?', a: 'A rocket launch follows five critical stages: Pre-launch checks ensure all systems are nominal, the ignition sequence fires the main engines, liftoff occurs when thrust exceeds weight, stage separation jettisons spent boosters, and finally payload deployment places the satellite or spacecraft into its target orbit.' },
    { q: '🌕 What did Chandrayaan-3 discover?', a: 'Chandrayaan-3 successfully soft-landed on the Moon\'s south pole on August 23, 2023. The Pragyan rover confirmed the presence of sulfur, aluminum, iron, and other elements. The Vikram lander\'s ChaSTE instrument measured lunar surface thermal properties for the first time near the south pole.' },
    { q: '🛰️ How do satellites stay in orbit?', a: 'Satellites maintain orbit through a precise balance between their forward velocity and Earth\'s gravitational pull. At the correct orbital velocity (~7.8 km/s for LEO), the satellite continuously "falls" toward Earth but moves forward fast enough that Earth\'s surface curves away beneath it.' },
    { q: '⚡ What is escape velocity?', a: 'Escape velocity is the minimum speed needed to break free from a celestial body\'s gravitational influence without further propulsion. For Earth, it\'s approximately 11.2 km/s (40,320 km/h). This is derived from the balance between kinetic energy and gravitational potential energy.' },
  ];

  useEffect(() => {
    if (activeQ === null) return;
    setDisplayText('');
    const text = questions[activeQ].a;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [activeQ]);

  return (
    <AnimatedSection style={{ background: '#000' }}>
      <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 40, textAlign: 'center', marginBottom: 40 }}>
        Try a Question<span style={{ animation: 'blink 0.7s infinite', color: 'var(--accent-blue)' }}>|</span>
      </h2>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {questions.map((q, i) => (
            <GlowButton key={i} label={q.q} color="blue" size="md" fullWidth onClick={() => setActiveQ(i)} />
          ))}
        </div>
        {activeQ !== null && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.4 }}
            style={{ background: 'rgba(5,10,30,0.8)', borderLeft: '3px solid var(--accent-blue)', borderRadius: '0 12px 12px 0', padding: 24, marginBottom: 24, overflow: 'hidden' }}
          >
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{displayText}</p>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: 'var(--accent-blue)', marginTop: 16, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, padding: '4px 12px', display: 'inline-block' }}>
              📄 Official ISRO Document
            </div>
          </motion.div>
        )}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <GlowButton label="Ask Your Own Question →" color="blue" size="lg" onClick={() => navigate('/chat')} />
        </div>
      </div>
    </AnimatedSection>
  );
};

// ─── STATS SECTION ───
const CountUp = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const inView = useInView(ref as any, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1500;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, target]);

  return <span ref={ref as any}>{count}{suffix}</span>;
};

const StatsSection = () => {
  const stats = [
    { value: 5, suffix: '+', label: 'Official Documents' },
    { value: 12, suffix: '+', label: 'Missions Covered' },
    { value: 2, suffix: 's', label: 'Response Time', prefix: '<' },
    { value: 100, suffix: '%', label: 'Source Verified' },
  ];

  return (
    <AnimatedSection style={{ background: 'rgba(0,5,20,0.8)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 60, color: 'var(--accent-blue)', fontWeight: 700 }}>
              {s.prefix}<CountUp target={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: 'var(--text-secondary)', letterSpacing: 1, marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
};

// ─── ARCHITECTURE SECTION ───
const ArchitectureSection = () => {
  const nodes = ['📄 ISRO PDFs', '🔢 Embeddings', '🗄️ ChromaDB', '🔍 Retrieval', '⚡ Gemini Flash', '💬 Answer'];
  const pills = ['🐍 Python + LangChain', '🗄️ ChromaDB', '⚡ Gemini Flash API'];

  return (
    <AnimatedSection>
      <SectionTitle text="Mission Architecture ⚙️" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, maxWidth: 1000, margin: '0 auto 40px', flexWrap: 'wrap' }}>
        {nodes.map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 12, border: '1px solid var(--accent-blue)',
              background: 'rgba(0,15,40,0.8)', borderRadius: 8, padding: '14px 18px', minWidth: 110, textAlign: 'center',
              color: 'var(--text-primary)',
            }}>
              {n}
            </div>
            {i < nodes.length - 1 && (
              <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, var(--accent-blue), rgba(0,212,255,0.3))', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', position: 'absolute', top: -3, animation: `glow-line 2s ${i * 0.3}s infinite linear` }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {pills.map((p, i) => (
          <span key={i} style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: 12, padding: '8px 18px',
            background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 20, color: 'var(--text-secondary)',
          }}>{p}</span>
        ))}
      </div>
    </AnimatedSection>
  );
};

// ─── TEAM SECTION ───
const TeamSection = () => {
  const team = [
    { name: 'Arjun Mehta', role: 'TEAM LEAD', color: 'var(--accent-gold)', tagline: 'Orchestrating the mission' },
    { name: 'Priya Sharma', role: 'AI ENGINEER', color: 'var(--accent-blue)', tagline: 'Training the intelligence' },
    { name: 'Rahul Kumar', role: 'DATA ENGINEER', color: 'var(--accent-purple)', tagline: 'Structuring the knowledge' },
    { name: 'Ananya Desai', role: 'FRONTEND', color: 'var(--accent-orange)', tagline: 'Crafting the experience' },
    { name: 'Vikram Singh', role: 'QA SPECIALIST', color: 'var(--accent-green)', tagline: 'Ensuring mission success' },
  ];

  return (
    <AnimatedSection>
      <SectionTitle text="Mission Crew 🧑‍🚀" />
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
        {team.map((t, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }}>
            <GlassCard accentColor={t.color} style={{ textAlign: 'center', minWidth: 180 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', border: `2px solid ${t.color}`,
                margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, background: 'rgba(0,0,0,0.4)',
              }}>
                🧑‍🚀
              </div>
              <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15 }}>{t.name}</h3>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: t.color, marginTop: 4 }}>{t.role}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>{t.tagline}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  );
};


// ─── FOOTER ───
const Footer = () => (
  <footer style={{ borderTop: '1px solid rgba(0,212,255,0.15)', padding: '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: 'var(--accent-blue)' }}>ASTRO</span>
    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: 'var(--text-dim)' }}>Built at Hackathon 2025</span>
    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: 'var(--text-dim)' }}>Space Education Bot v1.0</span>
  </footer>
);

// ─── LANDING PAGE ───
const LandingPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
    <HeroSection />
    <SolutionSection />
    <FeaturesSection />
    <MissionsSection />
    <DemoSection />
    <StatsSection />
    <ArchitectureSection />
    <TeamSection />
    <Footer />
    <ScrollToTopRocket />
  </motion.div>
);

export default LandingPage;
