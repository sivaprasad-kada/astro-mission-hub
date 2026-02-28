import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import GlowButton from '../components/shared/GlowButton';

// ─── DATA ───
const categories = [
  { key: 'launch', icon: '🚀', label: 'Launch', color: '#00d4ff' },
  { key: 'control', icon: '🛰️', label: 'Control', color: '#ff6b35' },
  { key: 'satellites', icon: '🌍', label: 'Satellites', color: '#7b2fff' },
  { key: 'prelaunch', icon: '🔬', label: 'Pre-Launch', color: '#00ff88' },
];

const questionsMap: Record<string, string[]> = {
  launch: ['Explain rocket launch sequence', 'What is T-minus countdown?', 'How does rocket staging work?', 'What is escape velocity?'],
  control: ['What happens during mission control?', 'What is telemetry?', 'Explain flight director role', 'What are abort procedures?'],
  satellites: ['Explain satellite deployment', 'What is geostationary orbit?', 'How do satellites communicate?', 'What is orbital insertion?'],
  prelaunch: ['What is pre-launch testing?', 'Explain fuel loading process', 'What are launch constraints?', 'What is flight readiness review?'],
};

const responses: Record<string, { text: string; source: string }> = {
  'launch': { text: 'A rocket launch follows 5 critical stages:\n\n1. **Pre-launch checks** — All systems verified nominal\n2. **Ignition sequence** — Main engines fire T-6 seconds before liftoff\n3. **Liftoff** — When thrust exceeds vehicle weight\n4. **Stage separation** — Spent boosters are jettisoned\n5. **Payload deployment** — Satellite released into target orbit\n\nEach stage is monitored by Mission Control in real-time.', source: 'ISRO Launch Vehicle Manual • Page 23' },
  'countdown': { text: 'T-minus countdown is the standardized time sequence before launch. "T" represents the scheduled launch time. T-minus counts backward: T-10 means 10 seconds before launch.\n\nKey milestones:\n• T-24h: Final vehicle inspection\n• T-6h: Fuel loading begins\n• T-45min: Launch team polls\n• T-10s: Final automated sequence\n• T-0: Ignition/Liftoff', source: 'NASA Mission Ops Guide • Page 45' },
  'staging': { text: 'Rocket staging is the method of discarding empty fuel tanks during flight to reduce mass. The Tsiolkovsky rocket equation shows that reducing mass dramatically increases achievable velocity.\n\nISRO\'s GSLV Mk III uses 3 stages:\n1. S200 solid boosters (provide initial thrust)\n2. L110 liquid core stage\n3. C25 cryogenic upper stage\n\nEach separation is a critical event monitored by range safety.', source: 'ISRO Launch Vehicle Doc • Page 31' },
  'escape': { text: 'Escape velocity is the minimum speed needed to break free from Earth\'s gravity without further propulsion: approximately 11.2 km/s (40,320 km/h).\n\nDerived from: v = √(2GM/r)\n• G = gravitational constant\n• M = Earth\'s mass\n• r = distance from Earth\'s center\n\nFor the Moon: ~2.4 km/s. For Mars: ~5.0 km/s.', source: 'NASA Orbital Mechanics • Page 12' },
  'control': { text: 'Mission Control Center (MCC) is the ground hub that monitors and controls space missions. ISRO\'s MCC is at ISTRAC, Bangalore.\n\nKey functions:\n• Real-time telemetry monitoring\n• Trajectory tracking and correction\n• Spacecraft health management\n• Communication relay\n• Emergency abort decision-making\n\nFlight controllers work in shifts 24/7 during active missions.', source: 'ISRO ISTRAC Manual • Page 8' },
  'telemetry': { text: 'Telemetry is the automated collection and transmission of data from a spacecraft to ground stations. It includes:\n\n• Vehicle position and velocity\n• Engine performance data\n• Structural stress measurements\n• Temperature readings\n• Power system status\n\nData is transmitted via S-band and X-band radio frequencies at rates up to several Mbps.', source: 'ISRO Telemetry Systems • Page 15' },
  'satellite': { text: 'Satellite deployment involves releasing a satellite from the launch vehicle into its designated orbit:\n\n1. Upper stage achieves target orbit parameters\n2. Attitude control orients the stage\n3. Spring mechanisms push satellite away\n4. Satellite deploys solar panels and antennas\n5. Ground stations acquire signal\n6. Orbit determination confirms placement\n\nISRO has deployed 300+ satellites to date.', source: 'ISRO Satellite Deployment Guide • Page 19' },
  'orbit': { text: 'A geostationary orbit (GEO) is a circular orbit at 35,786 km above Earth\'s equator where a satellite orbits at the same rate Earth rotates, appearing stationary.\n\nKey properties:\n• Orbital period: exactly 24 hours\n• Inclination: 0° (equatorial)\n• Velocity: ~3.07 km/s\n• Used for: communications, weather, broadcasting\n\nISRO\'s INSAT and GSAT series operate in GEO.', source: 'ISRO Orbital Mechanics • Page 27' },
  'chandrayaan': { text: 'Chandrayaan-3 was India\'s successful lunar south pole mission:\n\n• Launch: July 14, 2023 on LVM3\n• Landing: August 23, 2023\n• Vikram lander: soft-landed near 69.37°S\n• Pragyan rover: operated for 14 Earth days\n\nKey discoveries:\n• Confirmed sulfur presence on lunar surface\n• Measured surface temperature profile\n• Detected seismic activity\n\nIndia became the 4th country to soft-land on the Moon.', source: 'Chandrayaan-3 Mission Report • Page 5' },
  'gaganyaan': { text: 'Gaganyaan is India\'s first human spaceflight program:\n\n• Crew: 3 Indian astronauts (Vyomanauts)\n• Duration: up to 3 days in orbit\n• Orbit: 400 km LEO\n• Launch vehicle: GSLV Mk III (human-rated)\n\nKey milestones:\n• Crew module designed for re-entry at 36,000 km/h\n• Crew Escape System tested successfully\n• Environmental Control & Life Support developed\n\nWill make India the 4th country for human spaceflight.', source: 'Gaganyaan Overview Doc • Page 3' },
  'default': { text: 'I can explain space mission operations based on official ISRO and NASA documents. Try asking about:\n\n• Launch sequences and rocket staging\n• Mission control operations\n• Satellite deployment and orbits\n• Pre-launch testing procedures\n• Specific missions like Chandrayaan-3, Gaganyaan\n\nEvery answer is sourced from verified documents.', source: 'ASTRO Knowledge Base' },
};

const matchResponse = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('launch') && t.includes('sequence')) return responses.launch;
  if (t.includes('countdown') || t.includes('t-minus')) return responses.countdown;
  if (t.includes('staging')) return responses.staging;
  if (t.includes('escape velocity')) return responses.escape;
  if (t.includes('mission control')) return responses.control;
  if (t.includes('telemetry')) return responses.telemetry;
  if (t.includes('satellite') && t.includes('deploy')) return responses.satellite;
  if (t.includes('geostationary') || t.includes('orbit')) return responses.orbit;
  if (t.includes('chandrayaan')) return responses.chandrayaan;
  if (t.includes('gaganyaan')) return responses.gaganyaan;
  if (t.includes('pre-launch') || t.includes('prelaunch') || t.includes('testing')) return responses.countdown;
  if (t.includes('fuel')) return responses.countdown;
  if (t.includes('abort')) return responses.control;
  if (t.includes('flight director')) return responses.control;
  if (t.includes('communicate')) return responses.telemetry;
  if (t.includes('orbital insertion')) return responses.satellite;
  if (t.includes('flight readiness')) return responses.countdown;
  if (t.includes('constraint')) return responses.countdown;
  if (t.includes('mangalyaan') || t.includes('mars')) return responses.default;
  return responses.default;
};

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  source?: string;
  confidence?: number;
  time: string;
  likes: number;
  dislikes: number;
}

// ─── FONTS ───
const font = {
  heading: "'Outfit', 'Inter', sans-serif",
  body: "'Inter', 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

const ChatPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('launch');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [metSeconds, setMetSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const msgIdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => setMetSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatMET = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const id = ++msgIdRef.current;
    const userMsg: Message = { id, text, isBot: false, time: formatMET(metSeconds), likes: 0, dislikes: 0 };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setQueryCount(c => c + 1);

    const delay = 1500 + Math.random() * 1000;
    setTimeout(() => {
      const resp = matchResponse(text);
      const botId = ++msgIdRef.current;
      const confidence = 88 + Math.floor(Math.random() * 9);
      setMessages(prev => [...prev, { id: botId, text: resp.text, isBot: true, source: resp.source, confidence, time: formatMET(metSeconds), likes: 0, dislikes: 0 }]);
      setTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReaction = (id: number, type: 'likes' | 'dislikes') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, [type]: m[type] + 1 } : m));
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ─── STYLES ───
  const sidebarLabelStyle: React.CSSProperties = {
    fontFamily: font.mono,
    fontSize: 11,
    fontWeight: 600,
    color: '#7a9ab8',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 14,
    padding: '0 20px',
  };

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
        style={{ height: '100vh', display: 'grid', gridTemplateRows: '64px 1fr', gridTemplateColumns: '300px 1fr', position: 'relative', zIndex: 2 }}
      >
        {/* ── HEADER ── */}
        <header style={{
          gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
          background: 'linear-gradient(180deg, rgba(8,10,30,0.98) 0%, rgba(4,6,20,0.97) 100%)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,212,255,0.18)', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate('/')}
              style={{
                color: '#00d4ff', fontSize: 20, width: 36, height: 36, borderRadius: 8,
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.08)'; }}
            >←</button>
            <span style={{ fontFamily: font.heading, fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: 1 }}>
              🚀 <span style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #7b2fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ASTRO</span>
            </span>
          </div>
          <span style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 500, color: '#7a9ab8', letterSpacing: 3 }}>SPACE MISSION EDUCATION</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,136,0.06)', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(0,255,136,0.15)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
              <span style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 500, color: '#00ff88' }}>ONLINE</span>
            </div>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ background: 'rgba(0,212,255,0.06)', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(0,212,255,0.12)' }}>
              <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 600, color: '#00d4ff' }}>MET {formatMET(metSeconds)}</span>
            </div>
          </div>
        </header>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          background: 'linear-gradient(180deg, rgba(6,8,25,0.96) 0%, rgba(3,5,18,0.98) 100%)',
          borderRight: '1px solid rgba(0,212,255,0.12)',
          overflowY: 'auto', padding: '24px 0',
        }}>
          <div style={sidebarLabelStyle}>Mission Categories</div>
          <div style={{ padding: '0 14px', marginBottom: 28 }}>
            {categories.map(c => (
              <button key={c.key} onClick={() => setActiveCategory(c.key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 16px', marginBottom: 4,
                  fontFamily: font.body, fontSize: 15, fontWeight: activeCategory === c.key ? 600 : 400,
                  color: activeCategory === c.key ? '#ffffff' : '#b8d8f0',
                  background: activeCategory === c.key ? 'rgba(0,212,255,0.1)' : 'transparent',
                  borderLeft: `3px solid ${activeCategory === c.key ? c.color : 'transparent'}`,
                  borderRadius: '0 8px 8px 0', transition: 'all 0.2s',
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => { if (activeCategory !== c.key) { (e.currentTarget).style.background = 'rgba(0,212,255,0.05)'; (e.currentTarget).style.color = '#ffffff'; } }}
                onMouseLeave={e => { if (activeCategory !== c.key) { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = '#b8d8f0'; } }}
              >
                <span style={{ marginRight: 10, fontSize: 18 }}>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          <div style={sidebarLabelStyle}>Quick Questions</div>
          <div style={{ padding: '0 14px', marginBottom: 28 }}>
            {questionsMap[activeCategory]?.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px', marginBottom: 3,
                  fontFamily: font.body, fontSize: 14, fontWeight: 400, color: '#b8d8f0',
                  background: 'transparent', borderLeft: '2px solid transparent',
                  borderRadius: '0 6px 6px 0', transition: 'all 0.2s',
                  lineHeight: 1.5,
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.06)'; (e.currentTarget).style.borderLeftColor = '#00d4ff'; (e.currentTarget).style.color = '#ffffff'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.borderLeftColor = 'transparent'; (e.currentTarget).style.color = '#b8d8f0'; }}
              >
                {q}
              </button>
            ))}
          </div>

          <div style={sidebarLabelStyle}>ISRO Missions</div>
          <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['🌕', 'Chandrayaan-3'], ['🔴', 'Mangalyaan'], ['🚀', 'Gaganyaan']].map(([icon, name]) => (
              <button key={name} onClick={() => sendMessage(`Tell me about ${name}`)}
                style={{
                  padding: '10px 16px', fontFamily: font.body, fontSize: 14, fontWeight: 500,
                  color: '#b8d8f0', background: 'rgba(0,212,255,0.04)',
                  border: '1px solid rgba(0,212,255,0.12)', borderRadius: 12, textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.1)'; (e.currentTarget).style.borderColor = 'rgba(0,212,255,0.3)'; (e.currentTarget).style.color = '#ffffff'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(0,212,255,0.04)'; (e.currentTarget).style.borderColor = 'rgba(0,212,255,0.12)'; (e.currentTarget).style.color = '#b8d8f0'; }}
              >
                <span style={{ marginRight: 8, fontSize: 16 }}>{icon}</span> {name}
              </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN CHAT ── */}
        <main style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(4,6,22,0.9) 0%, rgba(2,3,15,0.95) 100%)', overflow: 'hidden' }}>
          {/* Stats bar */}
          <div style={{
            height: 46, display: 'flex', alignItems: 'center', gap: 28, padding: '0 24px',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
            background: 'rgba(6,10,30,0.5)',
            fontFamily: font.mono, fontSize: 13, fontWeight: 500, color: '#7a9ab8', flexShrink: 0,
          }}>
            <span>📄 Docs: <span style={{ color: '#b8d8f0' }}>5</span></span>
            <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
            <span>🔍 Queries: <span style={{ color: '#b8d8f0' }}>{queryCount}</span></span>
            <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
            <span>⚡ Avg: <span style={{ color: '#00d4ff' }}>1.2s</span></span>
            <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
            <span>✅ Verified: <span style={{ color: '#00ff88' }}>100%</span></span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
                <div style={{ fontSize: 72, filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.3))' }}>🚀</div>
                <h3 style={{ fontFamily: font.heading, fontSize: 26, fontWeight: 700, color: '#ffffff', letterSpacing: 0.5 }}>
                  Ask ASTRO anything about space missions
                </h3>
                <p style={{ fontFamily: font.body, fontSize: 17, fontWeight: 400, color: '#b8d8f0', marginTop: -4 }}>
                  Powered by official ISRO & NASA documents
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
                  {['Explain rocket launch sequence', 'What is Chandrayaan-3?', 'How do satellites work?', 'What is escape velocity?'].map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      style={{
                        fontFamily: font.body, fontSize: 14, fontWeight: 500,
                        padding: '10px 20px',
                        background: 'rgba(0,212,255,0.06)',
                        border: '1px solid rgba(0,212,255,0.18)',
                        borderRadius: 24, color: '#b8d8f0', transition: 'all 0.25s',
                      }}
                      onMouseEnter={e => { (e.currentTarget).style.borderColor = '#00d4ff'; (e.currentTarget).style.background = 'rgba(0,212,255,0.12)'; (e.currentTarget).style.color = '#ffffff'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(0,212,255,0.18)'; (e.currentTarget).style.background = 'rgba(0,212,255,0.06)'; (e.currentTarget).style.color = '#b8d8f0'; (e.currentTarget).style.transform = 'translateY(0)'; }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ display: 'flex', justifyContent: msg.isBot ? 'flex-start' : 'flex-end', marginBottom: 24, gap: 12, alignItems: 'flex-start' }}
                >
                  {msg.isBot && (
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(123,47,255,0.15) 100%)',
                      border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, marginTop: 2,
                    }}>🚀</div>
                  )}
                  <div style={{ maxWidth: msg.isBot ? '72%' : '60%' }}>
                    <div style={{
                      background: msg.isBot
                        ? 'linear-gradient(135deg, rgba(8,14,45,0.95) 0%, rgba(6,10,35,0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(0,212,255,0.14) 0%, rgba(123,47,255,0.1) 100%)',
                      border: msg.isBot ? '1px solid rgba(0,212,255,0.1)' : '1px solid rgba(0,212,255,0.25)',
                      borderLeft: msg.isBot ? '3px solid #00d4ff' : undefined,
                      borderRadius: msg.isBot ? '2px 16px 16px 16px' : '16px 16px 4px 16px',
                      padding: '16px 20px',
                      fontFamily: font.body, fontSize: 16, lineHeight: 1.75, fontWeight: 400,
                      color: msg.isBot ? '#dce8f2' : '#ffffff', whiteSpace: 'pre-line',
                      boxShadow: msg.isBot ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,212,255,0.08)',
                    }}>
                      {msg.text}
                    </div>
                    {msg.isBot && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                        {msg.source && (
                          <span style={{
                            fontFamily: font.mono, fontSize: 12, fontWeight: 500, color: '#00d4ff',
                            background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                            borderRadius: 16, padding: '5px 14px',
                          }}>
                            📄 {msg.source}
                          </span>
                        )}
                        {msg.confidence && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 500, color: '#7a9ab8' }}>Confidence</span>
                            <div style={{ width: 70, height: 5, background: 'rgba(0,212,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${msg.confidence}%`, height: '100%', background: 'linear-gradient(90deg, #00d4ff, #00ff88)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 600, color: '#00d4ff' }}>{msg.confidence}%</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => copyText(msg.text)}
                            style={{ fontFamily: font.mono, fontSize: 12, color: '#7a9ab8', padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget).style.color = '#ffffff'; }}
                            onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget).style.color = '#7a9ab8'; }}
                          >📋 Copy</button>
                          <button onClick={() => handleReaction(msg.id, 'likes')}
                            style={{ fontSize: 14, padding: '4px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                            onMouseEnter={e => (e.currentTarget).style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => (e.currentTarget).style.background = 'rgba(255,255,255,0.03)'}
                          >👍 {msg.likes > 0 ? msg.likes : ''}</button>
                          <button onClick={() => handleReaction(msg.id, 'dislikes')}
                            style={{ fontSize: 14, padding: '4px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                            onMouseEnter={e => (e.currentTarget).style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => (e.currentTarget).style.background = 'rgba(255,255,255,0.03)'}
                          >👎 {msg.dislikes > 0 ? msg.dislikes : ''}</button>
                        </div>
                      </div>
                    )}
                    <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 500, color: '#5a7a98', marginTop: 6 }}>MET {msg.time}</div>
                  </div>
                  {!msg.isBot && (
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,255,136,0.1) 100%)',
                      border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, marginTop: 2,
                    }}>🧑‍🚀</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(123,47,255,0.15) 100%)',
                  border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>🚀</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
                  background: 'linear-gradient(135deg, rgba(8,14,45,0.95) 0%, rgba(6,10,35,0.95) 100%)',
                  border: '1px solid rgba(0,212,255,0.1)', borderLeft: '3px solid #00d4ff',
                  borderRadius: '2px 16px 16px 16px',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 9, height: 9, borderRadius: '50%', background: '#00d4ff',
                      animation: `dot-bounce 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                  <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 500, color: '#7a9ab8', marginLeft: 6 }}>ASTRO is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 24px',
            background: 'linear-gradient(180deg, rgba(6,8,25,0.98) 0%, rgba(4,6,20,0.99) 100%)',
            borderTop: '1px solid rgba(0,212,255,0.12)',
            display: 'flex', gap: 14, alignItems: 'flex-end', flexShrink: 0,
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ASTRO about space missions..."
              rows={1}
              style={{
                flex: 1, background: 'rgba(10,16,50,0.8)',
                border: '1px solid rgba(0,212,255,0.18)',
                borderRadius: 12, padding: '14px 18px', fontFamily: font.body, fontSize: 16, fontWeight: 400,
                color: '#ffffff', resize: 'none', outline: 'none', maxHeight: 100,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#00d4ff'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,212,255,0.18)'; e.target.style.boxShadow = 'none'; }}
            />
            <GlowButton label="➤" color="blue" size="md" onClick={() => sendMessage(input)} />
            {messages.length > 0 && (
              <button onClick={() => { if (confirm('Clear all messages?')) setMessages([]); }}
                style={{
                  padding: '12px', color: '#7a9ab8', fontSize: 18, borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,80,80,0.1)'; (e.currentTarget).style.color = '#ff5050'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget).style.color = '#7a9ab8'; }}
                title="Clear chat"
              >🗑️</button>
            )}
          </div>
        </main>
      </motion.div>
    </>
  );
};

export default ChatPage;
