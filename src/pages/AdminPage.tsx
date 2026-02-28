import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import GlassCard from '../components/shared/GlassCard';
import GlowButton from '../components/shared/GlowButton';

const font = { heading: "'Orbitron', sans-serif", body: "'Rajdhani', sans-serif", mono: "'Share Tech Mono', monospace" };

const navItems = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'conversations', icon: '💬', label: 'Conversations' },
  { key: 'documents', icon: '📄', label: 'Documents' },
  { key: 'config', icon: '⚙️', label: 'Bot Config' },
  { key: 'analytics', icon: '📈', label: 'Analytics' },
  { key: 'missions', icon: '🚀', label: 'Missions' },
];

// Mock data
const mockConversations = Array.from({ length: 50 }, (_, i) => ({
  id: `Q-${String(i + 1).padStart(3, '0')}`,
  query: ['Explain rocket launch sequence', 'What is Chandrayaan-3?', 'How do satellites communicate?', 'What is escape velocity?', 'Tell me about Gaganyaan', 'What is mission control?', 'Explain orbital mechanics', 'What is telemetry?'][i % 8],
  responseTime: (0.8 + Math.random() * 2).toFixed(1) + 's',
  topic: ['Launch', 'Missions', 'Satellites', 'Launch', 'Missions', 'Control', 'Satellites', 'Control'][i % 8],
  timestamp: `2025-01-${String(28 - (i % 28)).padStart(2, '0')} ${String(9 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
  confidence: 88 + Math.floor(Math.random() * 10),
}));

const weeklyData = [
  { day: 'Mon', queries: 45 }, { day: 'Tue', queries: 62 }, { day: 'Wed', queries: 38 },
  { day: 'Thu', queries: 71 }, { day: 'Fri', queries: 55 }, { day: 'Sat', queries: 28 }, { day: 'Sun', queries: 33 },
];

const topicData = [
  { name: 'Launch', value: 35, color: 'var(--accent-blue)' },
  { name: 'Mission Control', value: 28, color: 'var(--accent-orange)' },
  { name: 'Satellites', value: 22, color: 'var(--accent-purple)' },
  { name: 'Pre-Launch', value: 15, color: 'var(--accent-green)' },
];

const dailyData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, queries: 20 + Math.floor(Math.random() * 60) }));
const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, queries: Math.floor(Math.random() * 40) }));
const responseTimeData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, time: 1.0 + Math.random() * 1.5 }));

const topQueries = [
  { rank: 1, query: 'Explain rocket launch sequence', count: 47, last: '2 hours ago' },
  { rank: 2, query: 'What is Chandrayaan-3?', count: 38, last: '5 hours ago' },
  { rank: 3, query: 'How do satellites communicate?', count: 31, last: '1 day ago' },
  { rank: 4, query: 'What is escape velocity?', count: 28, last: '3 hours ago' },
  { rank: 5, query: 'Tell me about Gaganyaan', count: 24, last: '6 hours ago' },
  { rank: 6, query: 'Explain orbital mechanics', count: 22, last: '1 day ago' },
  { rank: 7, query: 'What is telemetry?', count: 19, last: '2 days ago' },
  { rank: 8, query: 'What is mission control?', count: 17, last: '4 hours ago' },
  { rank: 9, query: 'How does rocket staging work?', count: 15, last: '1 day ago' },
  { rank: 10, query: 'What is geostationary orbit?', count: 12, last: '3 days ago' },
];

const tooltipStyle = { backgroundColor: 'rgba(5,10,30,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontFamily: font.mono, fontSize: 11 };

// ─── OVERVIEW VIEW ───
const OverviewView = () => (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {[
        { label: 'TOTAL QUERIES', value: '1,247', sub: '+23 today', color: 'var(--accent-blue)' },
        { label: 'ACCURACY RATE', value: '98.4%', sub: '↑ trending up', color: 'var(--accent-green)' },
        { label: 'AVG RESPONSE', value: '1.8s', sub: '↓ improved', color: 'var(--accent-orange)' },
        { label: 'DOCS INDEXED', value: '5', sub: 'ALL SYSTEMS GO', color: 'var(--accent-purple)' },
      ].map((m, i) => (
        <GlassCard key={i} accentColor={m.color}>
          <div style={{ fontFamily: font.heading, fontSize: 36, color: m.color, marginBottom: 4 }}>{m.value}</div>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2 }}>{m.label}</div>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-secondary)', marginTop: 8 }}>{m.sub}</div>
        </GlassCard>
      ))}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 16 }}>RECENT CONVERSATIONS</div>
          {mockConversations.slice(0, 6).map((c, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: font.body, fontSize: 14, color: 'var(--text-secondary)', flex: 1 }}>{c.query}</span>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--accent-blue)', marginLeft: 12 }}>{c.responseTime}</span>
            </div>
          ))}
        </GlassCard>
        <GlassCard>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 16 }}>QUERY VOLUME — LAST 7 DAYS</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="queries" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
      <div>
        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 16 }}>TOPIC DISTRIBUTION</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={topicData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                  {topicData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            {topicData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                <span style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-secondary)' }}>{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>SYSTEM STATUS</div>
          {['🟢 ASTRO Bot — ONLINE', '🟢 ChromaDB — INDEXED', '🟢 Gemini Flash API — CONNECTED', '🟢 Document Store — 5/5 LOADED'].map((s, i) => (
            <div key={i} style={{ fontFamily: font.mono, fontSize: 12, color: 'var(--accent-green)', padding: '6px 0' }}>{s}</div>
          ))}
        </GlassCard>
        <GlassCard>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>EFFICIENCY GAUGE</div>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: `conic-gradient(var(--accent-blue) 0% 78%, rgba(0,212,255,0.1) 78% 100%)`, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(5,10,30,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.heading, fontSize: 22, color: 'var(--accent-blue)' }}>78%</div>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
);

// ─── CONVERSATIONS VIEW ───
const ConversationsView = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const perPage = 10;
  const filtered = mockConversations.filter(c => c.query.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div>
      <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
        placeholder="Search conversations..."
        style={{ width: '100%', padding: '12px 16px', background: 'rgba(5,10,40,0.8)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: font.body, fontSize: 15, marginBottom: 16, outline: 'none' }}
      />
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,212,255,0.05)' }}>
                {['ID', 'Query', 'Time', 'Topic', 'Timestamp', 'Confidence'].map(h => (
                  <th key={h} style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', padding: '12px 14px', textAlign: 'left', letterSpacing: 2 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                  <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', padding: '10px 14px' }}>{c.id}</td>
                  <td style={{ fontFamily: font.body, fontSize: 14, color: 'var(--text-secondary)', padding: '10px 14px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.query}</td>
                  <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--accent-blue)', padding: '10px 14px' }}>{c.responseTime}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontFamily: font.mono, fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(0,212,255,0.08)', color: 'var(--accent-blue)' }}>{c.topic}</span>
                  </td>
                  <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', padding: '10px 14px' }}>{c.timestamp}</td>
                  <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--accent-green)', padding: '10px 14px' }}>{c.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {Array.from({ length: Math.ceil(filtered.length / perPage) }, (_, i) => (
          <button key={i} onClick={() => setPage(i)}
            style={{ padding: '6px 12px', fontFamily: font.mono, fontSize: 11, background: page === i ? 'var(--accent-blue)' : 'rgba(0,212,255,0.08)', color: page === i ? '#000' : 'var(--text-secondary)', borderRadius: 4 }}
          >{i + 1}</button>
        ))}
      </div>
    </div>
  );
};

// ─── DOCUMENTS VIEW ───
const DocumentsView = () => {
  const docs = [
    { name: 'chandrayaan_3_mission.pdf', size: '5.2 MB', pages: 48, chunks: 142 },
    { name: 'gaganyaan_overview.pdf', size: '3.8 MB', pages: 36, chunks: 98 },
    { name: 'isro_launch_vehicle.pdf', size: '6.1 MB', pages: 62, chunks: 187 },
    { name: 'nasa_mission_ops.pdf', size: '4.5 MB', pages: 44, chunks: 131 },
    { name: 'satellite_deployment.pdf', size: '4.7 MB', pages: 41, chunks: 119 },
  ];

  return (
    <div>
      <div style={{ border: '2px dashed rgba(0,212,255,0.3)', borderRadius: 12, padding: 48, textAlign: 'center', marginBottom: 24, background: 'rgba(0,212,255,0.02)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
        <div style={{ fontFamily: font.mono, fontSize: 14, color: 'var(--text-secondary)' }}>DROP PDF FILES HERE</div>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>or click to browse</div>
      </div>
      <GlassCard style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,212,255,0.05)' }}>
              {['Filename', 'Size', 'Pages', 'Chunks', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', padding: '12px 14px', textAlign: 'left', letterSpacing: 2 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ fontFamily: font.mono, fontSize: 12, color: 'var(--text-secondary)', padding: '10px 14px' }}>📄 {d.name}</td>
                <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', padding: '10px 14px' }}>{d.size}</td>
                <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', padding: '10px 14px' }}>{d.pages}</td>
                <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-dim)', padding: '10px 14px' }}>{d.chunks}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontFamily: font.mono, fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(0,255,136,0.08)', color: 'var(--accent-green)' }}>INDEXED</span>
                </td>
                <td style={{ padding: '10px 14px', fontFamily: font.mono, fontSize: 12, color: 'var(--text-dim)' }}>👁️ 🗑️</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
      <div style={{ fontFamily: font.mono, fontSize: 12, color: 'var(--text-secondary)' }}>
        Storage: 24.3 MB / 500 MB
        <div style={{ height: 6, background: 'rgba(0,212,255,0.1)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
          <div style={{ width: '4.9%', height: '100%', background: 'var(--accent-blue)', borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
};

// ─── CONFIG VIEW ───
const ConfigView = () => {
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>PERSONALITY</div>
        <textarea defaultValue="You are ASTRO, an AI-powered Space Mission Operations Explainer Bot. You answer questions based solely on official ISRO and NASA documents. Always cite your sources with document name and page number. Be accurate, educational, and enthusiastic about space."
          style={{ width: '100%', height: 180, background: 'rgba(5,10,40,0.8)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: 12, fontFamily: font.body, fontSize: 14, color: 'var(--text-secondary)', resize: 'vertical', outline: 'none' }}
        />
      </GlassCard>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>MODEL SETTINGS</div>
        {[['Model', 'Gemini Flash'], ['Temperature', '0.3'], ['Max Tokens', '1024'], ['Top-K', '5']].map(([label, val]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{label}</label>
            <input defaultValue={val} style={{ width: '100%', padding: '8px 12px', background: 'rgba(5,10,40,0.8)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, fontFamily: font.mono, fontSize: 13, color: 'var(--text-primary)', outline: 'none' }} />
          </div>
        ))}
      </GlassCard>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>RETRIEVAL SETTINGS</div>
        {[['Chunk Size', '512'], ['Overlap', '50'], ['Top-K Results', '4'], ['Similarity Threshold', '0.75']].map(([label, val]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{label}</label>
            <input defaultValue={val} style={{ width: '100%', padding: '8px 12px', background: 'rgba(5,10,40,0.8)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, fontFamily: font.mono, fontSize: 13, color: 'var(--text-primary)', outline: 'none' }} />
          </div>
        ))}
      </GlassCard>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>RESTRICTED TOPICS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {['Military Applications', 'Classified Data', 'Political Opinions'].map(t => (
            <span key={t} style={{ fontFamily: font.mono, fontSize: 11, padding: '4px 12px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 14, color: 'var(--accent-orange)' }}>
              {t} ×
            </span>
          ))}
        </div>
        <input placeholder="Add restriction..." style={{ width: '100%', padding: '8px 12px', background: 'rgba(5,10,40,0.8)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, fontFamily: font.body, fontSize: 13, color: 'var(--text-primary)', outline: 'none' }} />
      </GlassCard>
      <div style={{ gridColumn: '1 / -1' }}>
        <GlowButton label={saved ? '✓ SAVED SUCCESSFULLY' : 'SAVE CONFIGURATION →'} color={saved ? 'green' : 'green'} size="lg" fullWidth onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} />
      </div>
    </div>
  );
};

// ─── ANALYTICS VIEW ───
const AnalyticsView = () => (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>QUERY VOLUME — 30 DAYS</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData}><Tooltip contentStyle={tooltipStyle} /><Line type="monotone" dataKey="queries" stroke="var(--accent-blue)" strokeWidth={2} dot={false} /></LineChart>
        </ResponsiveContainer>
      </GlassCard>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>RESPONSE TIME TREND</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={responseTimeData}><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="time" stroke="var(--accent-orange)" fill="rgba(255,107,53,0.15)" strokeWidth={2} /></AreaChart>
        </ResponsiveContainer>
      </GlassCard>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>QUERIES BY HOUR</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData}><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="queries" fill="var(--accent-purple)" radius={[2, 2, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>TOP QUERIES</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['#', 'Query', 'Count', 'Last Asked'].map(h => (
              <th key={h} style={{ fontFamily: font.mono, fontSize: 9, color: 'var(--text-dim)', padding: '8px 10px', textAlign: 'left' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {topQueries.map(q => (
              <tr key={q.rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--accent-blue)', padding: '6px 10px' }}>{q.rank}</td>
                <td style={{ fontFamily: font.body, fontSize: 13, color: 'var(--text-secondary)', padding: '6px 10px' }}>{q.query}</td>
                <td style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-primary)', padding: '6px 10px' }}>{q.count}</td>
                <td style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', padding: '6px 10px' }}>{q.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
      <GlassCard>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 12 }}>ACTIVITY HEATMAP (7d × 24h)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
          {Array.from({ length: 7 * 24 }, (_, i) => {
            const intensity = Math.random();
            return <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 2, background: `rgba(0,212,255,${0.05 + intensity * 0.5})` }} title={`${Math.floor(intensity * 40)} queries`} />;
          })}
        </div>
      </GlassCard>
    </div>
  </div>
);

// ─── MISSIONS VIEW ───
const MissionsView = () => {
  const missions = [
    { name: 'Chandrayaan-3', badge: 'C3', color: 'var(--accent-gold)', desc: 'India\'s successful lunar south pole mission. First country to land near the lunar south pole.', date: 'August 23, 2023', status: 'SUCCESS', facts: ['Vikram lander + Pragyan rover', 'Landed at 69.37°S latitude', 'Detected sulfur on lunar surface', '14-day mission on lunar surface'] },
    { name: 'Mangalyaan (MOM)', badge: 'MOM', color: 'var(--accent-orange)', desc: 'India\'s Mars Orbiter Mission — first Asian country to reach Mars orbit on the first attempt.', date: 'September 24, 2014', status: 'SUCCESS', facts: ['First Asian Mars mission', '300-day journey to Mars', 'Cost: $74 million (most cost-effective)', 'Operated for 8 years'] },
    { name: 'Gaganyaan', badge: 'GY', color: 'var(--accent-blue)', desc: 'India\'s first crewed spaceflight program — sending 3 astronauts to orbit.', date: '2025 (planned)', status: 'UPCOMING', facts: ['3 Indian Vyomanauts', '400 km LEO orbit', 'Up to 3-day mission', '4th country for human spaceflight'] },
    { name: 'Aditya L1', badge: 'A1', color: '#ffdd44', desc: 'India\'s first dedicated solar observation mission positioned at Lagrange Point 1.', date: 'September 2, 2023', status: 'ACTIVE', facts: ['Solar corona study', 'L1 Lagrange Point (1.5M km)', '7 scientific payloads', 'First Indian solar mission'] },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {missions.map((m, i) => (
        <GlassCard key={i} accentColor={m.color}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.heading, fontSize: 16, color: m.color, flexShrink: 0 }}>{m.badge}</div>
            <div>
              <h3 style={{ fontFamily: font.heading, fontSize: 18, margin: 0 }}>{m.name}</h3>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)' }}>{m.date}</div>
            </div>
            <span style={{ fontFamily: font.mono, fontSize: 10, padding: '2px 10px', borderRadius: 10, background: m.status === 'SUCCESS' ? 'rgba(0,255,136,0.08)' : 'rgba(0,212,255,0.08)', color: m.status === 'SUCCESS' ? 'var(--accent-green)' : 'var(--accent-blue)', marginLeft: 'auto' }}>{m.status}</span>
          </div>
          <p style={{ fontFamily: font.body, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{m.desc}</p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
            {m.facts.map((f, j) => (
              <li key={j} style={{ fontFamily: font.body, fontSize: 13, color: 'var(--text-dim)', padding: '4px 0', paddingLeft: 16, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: m.color }}>•</span>{f}
              </li>
            ))}
          </ul>
          <GlowButton label="Ask ASTRO →" color="blue" size="sm" href="/chat" />
        </GlassCard>
      ))}
    </div>
  );
};

// ─── ADMIN PAGE ───
const AdminPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date().toLocaleString()), 1000);
    return () => clearInterval(interval);
  }, []);

  const views: Record<string, React.ReactNode> = {
    overview: <OverviewView />,
    conversations: <ConversationsView />,
    documents: <DocumentsView />,
    config: <ConfigView />,
    analytics: <AnalyticsView />,
    missions: <MissionsView />,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      style={{ height: '100vh', display: 'grid', gridTemplateRows: '56px 1fr', gridTemplateColumns: '240px 1fr', position: 'relative', zIndex: 2 }}
    >
      {/* Header */}
      <header style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(2,2,18,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,212,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ color: 'var(--accent-blue)', fontSize: 18 }}>←</button>
          <span style={{ fontFamily: font.mono, fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 2 }}>ASTRO ADMIN • MISSION CONTROL DASHBOARD</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: font.mono, fontSize: 10, padding: '4px 12px', background: 'rgba(255,107,53,0.15)', color: 'var(--accent-orange)', borderRadius: 10 }}>ADMIN MODE</span>
          <span style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)' }}>{dateTime}</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside style={{ background: 'rgba(2,2,15,0.98)', borderRight: '1px solid rgba(0,212,255,0.15)', padding: '20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: font.mono, fontSize: 9, color: 'var(--text-dim)', letterSpacing: 3, padding: '0 16px', marginBottom: 12 }}>NAVIGATION</div>
          {navItems.map(n => (
            <button key={n.key} onClick={() => setActiveView(n.key)}
              style={{
                width: '100%', textAlign: 'left', padding: '11px 16px', fontFamily: font.body, fontSize: 15,
                color: activeView === n.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: activeView === n.key ? 'rgba(0,212,255,0.08)' : 'transparent',
                borderLeft: `3px solid ${activeView === n.key ? 'var(--accent-blue)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >{n.icon} {n.label}</button>
          ))}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontFamily: font.mono, fontSize: 9, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 8 }}>SYSTEM</div>
          {[['CPU', '23%', 'var(--accent-green)'], ['Memory', '67%', 'var(--accent-orange)'], ['API', 'Online', 'var(--accent-green)']].map(([k, v, c]) => (
            <div key={k} style={{ fontFamily: font.mono, fontSize: 10, color: 'var(--text-dim)', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />{k}: {v}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ overflowY: 'auto', padding: 24, background: 'rgba(1,1,12,0.6)' }}>
        <h2 style={{ fontFamily: font.heading, fontSize: 22, marginBottom: 24, color: 'var(--text-primary)' }}>
          {navItems.find(n => n.key === activeView)?.icon} {navItems.find(n => n.key === activeView)?.label}
        </h2>
        {views[activeView]}
      </main>
    </motion.div>
  );
};

export default AdminPage;
