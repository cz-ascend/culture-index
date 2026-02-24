import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { calcScores, fitScore, getProfile, traitLabel, barColor } from '../../lib/scoring'
import { ROLES } from '../../lib/data'

const PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234'

export default function ResultsPage() {
  const { query, isReady } = useRouter()
  const id = query.id
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [result, setResult] = useState(null)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isReady || !id) return
    fetch(`/api/get-results?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setSurvey(data)
        if (data.admin_notes) setNotes(data.admin_notes)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [isReady, id])

  const unlock = () => {
    if (pin !== PIN) { setPinErr(true); return }
    const responses = JSON.parse(survey.responses)
    const scores = calcScores(responses)
    const profile = getProfile(scores)
    const fit = fitScore(scores, survey.role)
    setResult({ scores, profile, fit })
    setAuthed(true)
  }

  const saveNotes = async () => {
    await fetch('/api/save-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes })
    })
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const copyExport = () => {
    const data = {
      candidate: survey.candidate_name,
      role: survey.role,
      completedAt: survey.completed_at,
      scores: result.scores,
      profile: result.profile.name,
      fit: result.fit,
      adminNotes: notes
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <Wrap bg="#f8fafc"><p style={{ padding: 40, color: '#6b7280' }}>Loading...</p></Wrap>
  if (error) return <Wrap bg="#f8fafc"><div style={{ padding: 40, textAlign: 'center' }}><p style={{ color: '#dc2626', fontWeight: 600 }}>Error: {error}</p></div></Wrap>
  if (!survey) return <Wrap bg="#f8fafc"><p style={{ padding: 40 }}>Not found.</p></Wrap>

  if (survey.status !== 'completed') return (
    <Wrap bg="#f8fafc">
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Survey not yet completed</h2>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Candidate: {survey.candidate_name}</p>
      </div>
    </Wrap>
  )

  if (!authed) return (
    <Wrap bg="#0f172a">
      <div style={{ maxWidth: 380, margin: 'auto', marginTop: 80, background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 8px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Results for {survey.candidate_name}</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Enter your admin PIN to unlock the full report</p>
        <input type="password" placeholder="Admin PIN" value={pin}
          onChange={e => { setPin(e.target.value); setPinErr(false) }}
          onKeyDown={e => e.key === 'Enter' && unlock()}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${pinErr ? '#dc2626' : '#d1d5db'}`, marginBottom: 8, fontSize: 15, textAlign: 'center', boxSizing: 'border-box' }} />
        {pinErr && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>Incorrect PIN</p>}
        <button onClick={unlock} style={{ width: '100%', padding: '12px 0', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          View Report →
        </button>
      </div>
    </Wrap>
  )

  const { scores, profile, fit } = result
  const role = ROLES[survey.role]
  const fitColor = fit >= 75 ? '#22c55e' : fit >= 55 ? '#f59e0b' : '#ef4444'
  const fitLabel = fit >= 75 ? 'Strong Fit' : fit >= 55 ? 'Moderate Fit' : 'Low Fit'
  const euNatural = scores.energy
  const euDemand = role.euDemand
  const euGap = euNatural - euDemand
  const euStatus = Math.abs(euGap) < 10
    ? { label: 'Aligned', color: '#22c55e', text: 'Natural energy matches role demands. Low burnout risk.' }
    : euGap > 20
    ? { label: 'Suppressed', color: '#ef4444', text: "Candidate may suppress natural intensity in this role. Monitor for frustration or disengagement." }
    : euGap < -20
    ? { label: 'Overstretched', color: '#f97316', text: "Role demands more than candidate's natural baseline. Monitor for fatigue." }
    : { label: 'Mild Gap', color: '#f59e0b', text: 'Slight mismatch. Monitor over time.' }

  const mainTraits = [
    { key: 'autonomy', label: 'A — Autonomy' },
    { key: 'social', label: 'B — Social Ability' },
    { key: 'patience', label: 'C — Patience' },
    { key: 'conformity', label: 'D — Conformity' },
    { key: 'energy', label: 'EU — Energy' },
  ]
  const valueTraits = [
    { key: 'integrity', label: 'Integrity', color: '#6366f1' },
    { key: 'humility', label: 'Humility', color: '#8b5cf6' },
    { key: 'grit', label: 'Grit', color: '#f97316' },
    { key: 'learning', label: 'Continuous Learning', color: '#22c55e' },
  ]

  if (showExport) return (
    <Wrap bg="#f8fafc">
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Export — {survey.candidate_name}</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Copy and paste into the Team Dashboard to compare candidates.</p>
          <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, maxHeight: 400, overflow: 'auto', marginBottom: 16 }}>
            <pre style={{ fontSize: 12, color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify({ candidate: survey.candidate_name, role: survey.role, completedAt: survey.completed_at, scores, profile: profile.name, fit, adminNotes: notes }, null, 2)}
            </pre>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={copyExport} style={{ ...Btn('#4f46e5'), flex: 1 }}>{copied ? '✓ Copied!' : 'Copy to Clipboard'}</button>
            <button onClick={() => setShowExport(false)} style={{ ...Btn('#e5e7eb'), flex: 1, color: '#374151' }}>← Back</button>
          </div>
        </div>
      </div>
    </Wrap>
  )

  return (
    <Wrap bg="#f8fafc">
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '28px 16px' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)', color: 'white', borderRadius: 16, padding: 28, marginBottom: 16 }}>
          <p style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Admin Report — Confidential</p>
          <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 12 }}>
            Candidate: <strong>{survey.candidate_name}</strong> · Role: <strong>{role.label}</strong> · Completed: <strong>{new Date(survey.completed_at).toLocaleDateString()}</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 52 }}>{profile.emoji}</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{profile.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: '4px 0' }}>{profile.summary}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{profile.description}</p>
            </div>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <p style={{ fontSize: 42, fontWeight: 800, color: fitColor, margin: 0 }}>{fit}%</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: fitColor, margin: 0 }}>{fitLabel}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{role.label}</p>
            </div>
          </div>
        </div>

        {/* Trait bars */}
        <Card title="Trait Profile (A–D + EU)">
          {mainTraits.map(t => {
            const v = scores[t.key]
            const ideal = role.idealTraits[t.key]
            const inRange = ideal && v >= ideal[0] && v <= ideal[1]
            return (
              <div key={t.key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{t.label}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {ideal && <span style={{ fontSize: 11, color: '#9ca3af' }}>Ideal: {ideal[0]}–{ideal[1]}</span>}
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: inRange ? '#dcfce7' : '#fef9c3', color: inRange ? '#16a34a' : '#b45309' }}>
                      {v} · {traitLabel(v)}
                    </span>
                  </div>
                </div>
                <div style={{ position: 'relative', height: 10, background: '#e5e7eb', borderRadius: 5 }}>
                  {ideal && <div style={{ position: 'absolute', height: 10, background: '#bbf7d0', borderRadius: 5, left: `${ideal[0]}%`, width: `${ideal[1] - ideal[0]}%` }} />}
                  <div style={{ position: 'absolute', height: 10, borderRadius: 5, width: `${v}%`, background: barColor(v) }} />
                </div>
              </div>
            )
          })}
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Green zone = ideal range for selected role</p>
        </Card>

        {/* EU Gap */}
        <div style={{ background: 'white', borderRadius: 14, padding: 24, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${euStatus.color}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>⚡ Energy Unit Gap Analysis</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
            <EUBox label="Natural EU" value={euNatural} color="#4f46e5" />
            <EUBox label={`Role Demand (${role.label})`} value={euDemand} color="#9ca3af" />
            <EUBox label="Gap" value={`${euGap > 0 ? '+' : ''}${euGap}`} color={euStatus.color} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: euStatus.color + '22', color: euStatus.color, marginRight: 8 }}>{euStatus.label}</span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{euStatus.text}</span>
        </div>

        {/* Core Values */}
        <Card title="Core Values Alignment">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {valueTraits.map(v => {
              const val = scores[v.key]
              const w = role.coreValueWeights[v.key]
              const priority = w >= 1.4 ? 'Critical' : w >= 1.1 ? 'High' : 'Standard'
              const pColor = priority === 'Critical' ? '#dc2626' : priority === 'High' ? '#d97706' : '#9ca3af'
              return (
                <div key={v.key} style={{ borderRadius: 10, padding: 14, border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{v.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: v.color }}>{val}</span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginBottom: 6 }}>
                    <div style={{ height: 6, borderRadius: 3, width: `${val}%`, background: v.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                    <span>{traitLabel(val)}</span>
                    <span style={{ fontWeight: 700, color: pColor }}>{priority} for role</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Strengths & Blind Spots */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Card title="💪 Strengths" compact>
            {profile.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#374151', margin: '0 0 6px', display: 'flex', gap: 6 }}><span style={{ color: '#22c55e' }}>✓</span>{s}</p>)}
          </Card>
          <Card title="⚠️ Blind Spots" compact>
            {profile.blindSpots.map((s, i) => <p key={i} style={{ fontSize: 13, color: '#374151', margin: '0 0 6px', display: 'flex', gap: 6 }}><span style={{ color: '#f59e0b' }}>!</span>{s}</p>)}
          </Card>
        </div>

        {/* Management Playbook */}
        <Card title="🎯 Management Playbook">
          {[
            { bg: '#eef2ff', labelColor: '#4338ca', label: 'How to manage this person',
              content: scores.autonomy >= 60
                ? ['Set outcome goals, not step-by-step instructions (e.g. "Close 3 deals this quarter" not "Call 10 prospects daily")', 'Monthly 1:1s focused on growth and vision, not status updates', 'Pair with a process-oriented operator for execution coverage']
                : ['Provide clear frameworks and defined scope before delegating', 'Weekly check-ins to ensure alignment and catch blockers early', 'Recognize precision and consistency explicitly and publicly'] },
            { bg: '#f0fdf4', labelColor: '#15803d', label: 'Best incentives',
              content: scores.autonomy >= 60 && scores.energy >= 60
                ? ['Performance bonuses tied to measurable outcomes', 'Expanded scope, title, or P&L responsibility', 'Public recognition in leadership forums']
                : scores.learning >= 60
                ? ['Learning stipends and access to industry conferences', 'Rotational assignments and cross-functional exposure', 'Mentorship pairing with senior leaders']
                : ['Stability, clear career path, and consistent feedback', 'Recognition for accuracy, reliability, and process ownership', 'Opportunities to own a defined process end-to-end'] },
            { bg: '#fffbeb', labelColor: '#b45309', label: 'Communication protocol',
              content: scores.social >= 60
                ? ['Prefer verbal: call or live meeting over long written briefs', "Lead with the headline — they'll ask for detail if needed", 'Put them in front of stakeholders — they shine in those settings']
                : ['Send detailed written briefs or docs before any meeting', "Give processing time — don't demand immediate verbal answers", 'Use data and evidence to build trust and credibility'] },
            { bg: '#faf5ff', labelColor: '#7e22ce', label: 'Conflict & feedback approach',
              content: scores.conformity <= 45
                ? ['Be direct — this person respects candor over diplomacy', 'Frame feedback around impact: "When X happened, the outcome was Y"', 'Skip the compliment sandwich — it dilutes the message for them']
                : ['Use scheduled review sessions, not ad-hoc criticism', 'Lead with what\'s working before areas to improve', 'Follow up with written summaries so they can process independently'] },
          ].map((block, i) => (
            <div key={i} style={{ background: block.bg, borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: block.labelColor, marginBottom: 8 }}>{block.label}</p>
              {block.content.map((c, j) => <p key={j} style={{ fontSize: 13, color: '#374151', margin: '0 0 4px' }}>→ {c}</p>)}
            </div>
          ))}
        </Card>

        {/* Role Fit Detail */}
        <Card title={`🔍 Role Fit Detail — ${role.label}`}>
          <div style={{ background: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>🚩 Red Flag for This Role</p>
            <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{role.redFlag}</p>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Key Qualities for This Role</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {role.keyQualities.map((q, i) => <span key={i} style={{ fontSize: 12, background: 'white', border: '1px solid #e5e7eb', padding: '4px 12px', borderRadius: 20, color: '#374151' }}>{q}</span>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>Thrives in</p>
              {profile.thrivesIn.map((t, i) => <p key={i} style={{ fontSize: 12, color: '#374151', margin: '0 0 4px' }}>✓ {t}</p>)}
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>Struggles with</p>
              {profile.strugglesWith.map((t, i) => <p key={i} style={{ fontSize: 12, color: '#374151', margin: '0 0 4px' }}>✗ {t}</p>)}
            </div>
          </div>
        </Card>

        {/* Admin Notes */}
        <Card title="📝 Admin Notes">
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>Add your own observations, interview notes, or context. Saved privately with this candidate's record.</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
            placeholder="e.g. Strong interview presence. Confirm alignment on long-term commitment before extending offer..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }} />
          <button onClick={saveNotes} style={{ ...Btn('#4f46e5'), marginTop: 10 }}>
            {notesSaved ? '✓ Saved' : 'Save Notes'}
          </button>
        </Card>

        {/* Actions */}
        <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={() => setShowExport(true)} style={Btn('#4f46e5')}>📤 Export JSON</button>
          <button onClick={() => window.location.href = '/'} style={{ ...Btn('#e5e7eb'), color: '#374151' }}>← Admin Dashboard</button>
          <button onClick={() => window.location.href = '/team'} style={Btn('#1e3a5f')}>📊 Team Dashboard</button>
        </div>
      </div>
    </Wrap>
  )
}

function Card({ title, children, compact }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: compact ? 18 : 24, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>{title}</h3>
      {children}
    </div>
  )
}

function EUBox({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: 10, border: `2px solid ${color}` }}>
      <p style={{ fontSize: 28, fontWeight: 800, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: '#6b7280', margin: 0, marginTop: 4 }}>{label}</p>
    </div>
  )
}

const Btn = bg => ({ padding: '10px 20px', borderRadius: 10, background: bg, color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' })

function Wrap({ children, bg }) {
  return <div style={{ minHeight: '100vh', background: bg || '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>{children}</div>
}
