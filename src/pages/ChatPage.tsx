import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import GlowButton from '../components/shared/GlowButton';
import GlassCard from '../components/shared/GlassCard';

// ─── DATA ───
const categories = [
  { key: 'launch', icon: '🚀', label: 'Launch', color: 'var(--accent-blue)' },
  { key: 'control', icon: '🛰️', label: 'Control', color: 'var(--accent-orange)' },
  { key: 'satellites', icon: '🌍', label: 'Satellites', color: 'var(--accent-purple)' },
  { key: 'prelaunch', icon: '🔬', label: 'Pre-Launch', color: 'var(--accent-green)' },
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

const ChatPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('launch');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [chartData, setChartData] = useState([{ v: 1.2 }, { v: 1.5 }, { v: 0.9 }, { v: 1.8 }, { v: 1.1 }, { v: 2.0 }, { v: 1.3 }, { v: 1.6 }]);
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
      setChartData(prev => [...prev.slice(-7), { v: 0.8 + Math.random() * 1.7 }]);
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

  const lastTopic = messages.filter(m => !m.isBot).slice(-1)[0]?.text || '';

  const font = { heading: "'Orbitron', sans-serif", body: "'Rajdhani', sans-serif", mono: "'Share Tech Mono', monospace" };
  const labelStyle: React.CSSProperties = { fontFamily: font.mono, fontSize: 9, color: 'var(--text-dim)', letterSpacing: 3, marginBottom: 12, padding: '0 16px' };

  const documents = ['chandrayaan_3_mission.pdf', 'gaganyaan_overview.pdf', 'isro_launch_vehicle.pdf', 'nasa_mission_ops.pdf', 'satellite_deployment.pdf'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: '100vh', display: 'grid', gridTemplateRows: '62px 1fr', gridTemplateColumns: '290px 1fr 260px', position: 'relative', zIndex: 2 }}
    >
      {/* HEADER */}
      <header style={{
        gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'rgba(2,2,18,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,212,255,0.15)', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ color: 'var(--accent-blue)', fontSize: 18 }}>←</button>
          <span style={{ fontFamily: font.heading, fontSize: 16, color: 'var(--accent-blue)' }}>🚀 ASTRO</span>
        </div>
        <span style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 3 }}>SPACE MISSION EDUCATION SYSTEM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />
            <span style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--accent-green)' }}>ONLINE</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily: font.mono, fontSize: 12, color: 'var(--accent-blue)' }}>MET {formatMET(metSeconds)}</span>
        </div>
      </header>

      {/* LEFT SIDEBAR */}
      <aside style={{ background: 'rgba(3,3,20,0.92)', borderRight: '1px solid rgba(0,212,255,0.15)', overflowY: 'auto', padding: '20px 0' }}>
        <div style={labelStyle}>MISSION CATEGORIES</div>
        <div style={{ padding: '0 12px', marginBottom: 24 }}>
          {categories.map(c => (
            <button key={c.key} onClick={() => setActiveCategory(c.key)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px', marginBottom: 4,
                fontFamily: font.body, fontSize: 14, color: activeCategory === c.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: activeCategory === c.key ? 'rgba(0,212,255,0.08)' : 'transparent',
                borderLeft: `3px solid ${activeCategory === c.key ? c.color : 'transparent'}`,
                borderRadius: '0 6px 6px 0', transition: 'all 0.2s',
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div style={labelStyle}>QUICK QUESTIONS</div>
        <div style={{ padding: '0 12px', marginBottom: 24 }}>
          {questionsMap[activeCategory]?.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 2,
                fontFamily: font.body, fontSize: 13, color: 'var(--text-secondary)',
                background: 'transparent', borderLeft: '2px solid transparent',
                borderRadius: '0 4px 4px 0', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(0,212,255,0.05)'; (e.target as HTMLElement).style.borderLeftColor = 'var(--accent-blue)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.borderLeftColor = 'transparent'; }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={labelStyle}>ISRO MISSIONS</div>
        <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[['🌕', 'Chandrayaan-3'], ['🔴', 'Mangalyaan'], ['🚀', 'Gaganyaan']].map(([icon, name]) => (
            <button key={name} onClick={() => sendMessage(`Tell me about ${name}`)}
              style={{ padding: '6px 12px', fontFamily: font.mono, fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 14, textAlign: 'left' }}
            >
              {icon} {name}
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main style={{ display: 'flex', flexDirection: 'column', background: 'rgba(1,1,15,0.8)', overflow: 'hidden' }}>
        {/* Stats bar */}
        <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 24, padding: '0 20px', borderBottom: '1px solid rgba(0,212,255,0.08)', fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>
          <span>📄 Docs: 5</span>
          <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
          <span>🔍 Queries: {queryCount}</span>
          <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
          <span>⚡ Avg: 1.2s</span>
          <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
          <span>✅ Verified: 100%</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
              <div style={{ fontSize: 60 }}>🚀</div>
              <h3 style={{ fontFamily: font.heading, fontSize: 20, color: 'var(--text-primary)' }}>Ask ASTRO anything about space missions</h3>
              <p style={{ fontFamily: font.body, fontSize: 15, color: 'var(--text-secondary)' }}>Powered by official ISRO & NASA documents</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {['Explain rocket launch sequence', 'What is Chandrayaan-3?', 'How do satellites work?', 'What is escape velocity?'].map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    style={{ fontFamily: font.body, fontSize: 13, padding: '8px 16px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 20, color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.borderColor = 'var(--accent-blue)'}
                    onMouseLeave={e => (e.target as HTMLElement).style.borderColor = 'rgba(0,212,255,0.15)'}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', justifyContent: msg.isBot ? 'flex-start' : 'flex-end', marginBottom: 20, gap: 10, alignItems: 'flex-start' }}
              >
                {msg.isBot && <span style={{ fontSize: 24, marginTop: 4 }}>🚀</span>}
                <div style={{ maxWidth: msg.isBot ? '75%' : '65%' }}>
                  <div style={{
                    background: msg.isBot ? 'rgba(5,10,35,0.9)' : 'rgba(0,212,255,0.12)',
                    border: msg.isBot ? 'none' : '1px solid rgba(0,212,255,0.3)',
                    borderLeft: msg.isBot ? '3px solid var(--accent-blue)' : undefined,
                    borderRadius: msg.isBot ? '0 12px 12px 12px' : '16px 16px 4px 16px',
                    padding: '14px 18px', fontFamily: font.body, fontSize: 15, lineHeight: 1.7,
                    color: 'var(--text-secondary)', whiteSpace: 'pre-line',
                  }}>
                    {msg.text}
                  </div>
                  {msg.isBot && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                      {msg.source && (
                        <span style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--accent-blue)', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, padding: '3px 10px' }}>
                          📄 {msg.source}
                        </span>
                      )}
                      {msg.confidence && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: font.mono, fontSize: 9, color: 'var(--text-dim)' }}>Confidence</span>
                          <div style={{ width: 60, height: 4, background: 'rgba(0,212,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${msg.confidence}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontFamily: font.mono, fontSize: 9, color: 'var(--accent-blue)' }}>{msg.confidence}%</span>
                        </div>
                      )}
                      <button onClick={() => copyText(msg.text)} style={{ fontFamily: font.mono, fontSize: 9, color: 'var(--text-dim)', padding: '2px 8px' }}>📋</button>
                      <button onClick={() => handleReaction(msg.id, 'likes')} style={{ fontSize: 12 }}>👍 {msg.likes > 0 ? msg.likes : ''}</button>
                      <button onClick={() => handleReaction(msg.id, 'dislikes')} style={{ fontSize: 12 }}>👎 {msg.dislikes > 0 ? msg.dislikes : ''}</button>
                    </div>
                  )}
                  <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>MET {msg.time}</div>
                </div>
                {!msg.isBot && <span style={{ fontSize: 24, marginTop: 4 }}>🧑‍🚀</span>}
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 24 }}>🚀</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', background: 'rgba(5,10,35,0.9)', borderLeft: '3px solid var(--accent-blue)', borderRadius: '0 12px 12px 12px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)',
                    animation: `dot-bounce 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
                <span style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>ASTRO retrieving mission data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px', background: 'rgba(2,2,18,0.97)', borderTop: '1px solid rgba(0,212,255,0.15)', display: 'flex', gap: 12, alignItems: 'flex-end', flexShrink: 0 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ASTRO about space missions..."
            rows={1}
            style={{
              flex: 1, background: 'rgba(5,10,40,0.8)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 8, padding: '12px 16px', fontFamily: font.body, fontSize: 16,
              color: 'var(--text-primary)', resize: 'none', outline: 'none', maxHeight: 80,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.2)'}
          />
          <GlowButton label="➤" color="blue" size="md" onClick={() => sendMessage(input)} />
          {messages.length > 0 && (
            <button onClick={() => { if (confirm('Clear all messages?')) setMessages([]); }}
              style={{ padding: '10px', color: 'var(--text-dim)', fontSize: 16 }} title="Clear chat">🗑️</button>
          )}
        </div>
      </main>

      {/* RIGHT PANEL */}
      <aside style={{ background: 'rgba(2,2,18,0.9)', borderLeft: '1px solid rgba(0,212,255,0.15)', overflowY: 'auto', padding: '20px 0' }}>
        {/* ASTRO Status */}
        <div style={labelStyle}>ASTRO STATUS</div>
        <div style={{ padding: '0 12px', marginBottom: 20 }}>
          <GlassCard style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', border: '1px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 8px', boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>🚀</div>
            <div style={{ fontFamily: font.heading, fontSize: 14 }}>ASTRO</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: 'var(--text-secondary)' }}>Space Education AI</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
              <span style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--accent-green)' }}>ONLINE</span>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', marginLeft: 8 }}>v1.0.0</span>
            </div>
            <div style={{ marginTop: 12, textAlign: 'left' }}>
              {[['Documents', '5'], ['Missions', '12'], ['Languages', 'English']].map(([k, v]) => (
                <div key={k} style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-secondary)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  {k}: {v}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Knowledge Base */}
        <div style={labelStyle}>KNOWLEDGE BASE</div>
        <div style={{ padding: '0 12px', marginBottom: 20 }}>
          {documents.map(doc => (
            <div key={doc} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>📄 {doc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 3, background: 'rgba(0,212,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: font.mono, fontSize: 8, color: 'var(--accent-green)' }}>indexed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Activity Chart */}
        <div style={labelStyle}>LIVE ACTIVITY</div>
        <div style={{ padding: '0 12px', marginBottom: 20 }}>
          <div style={{ background: 'rgba(5,10,30,0.6)', borderRadius: 8, padding: 8 }}>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="v" stroke="var(--accent-blue)" fill="rgba(0,212,255,0.15)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last Topic */}
        {lastTopic && (
          <>
            <div style={labelStyle}>LAST TOPIC</div>
            <div style={{ padding: '0 12px' }}>
              <GlassCard style={{ padding: 12 }}>
                <div style={{ fontFamily: font.body, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{lastTopic}</div>
              </GlassCard>
            </div>
          </>
        )}
      </aside>
    </motion.div>
  );
};

export default ChatPage;
