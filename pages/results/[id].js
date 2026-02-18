
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { calcScores, fitScore, getProfile, traitLabel, barColor } from '../../lib/scoring'
import { ROLES } from '../../lib/data'

const PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234'

export default function ResultsPage() {
  const { query } = useRouter()
  const id = query.id
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [result, setResult] = useState(null)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('surveys').select('*').eq('id', id).single()
      .then(({ data }) => { setSurvey(data); if (data?.admin_notes) setNotes(data.admin_notes); setLoading(false) })
  }, [id])

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
    await supabase.from('surveys').update({ admin_notes: notes }).eq('id', id)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const copyExport = () => {
    const data = { candidate: survey.candidate_name, role: survey.role, completedAt: survey.completed_at, scores: result.scores, profile: result.profile.name, fit: result.fit, adminNotes: notes }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const pageStyle = { minHeight: '100vh', background: '#f9fafb', padding: 20, fontFamily: 'system-ui, sans-serif' }
  const cardStyle = { background: 'white', borderRadius: 16, padding: 28, maxWidth: 720, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }

  if (loading) return <div style={pageStyle}>Loading...</div>
  if (!survey) return <div style={pageStyle}>Not found.</div>
  if (survey.status !== 'completed') return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>⏳</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Survey not yet completed</h1>
        <p style={{ color: '#6b7280' }}>Candidate: {survey.candidate_name}</p>
      </div>
    </div>
  )

  if (!authed) return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🔒</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Results for {survey.candidate_name}</h1>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Enter your admin PIN to unlock the full report</p>
        <input type="password" placeholder="Admin PIN" value={pin}
          onChange={e => { setPin(e.target.value); setPinErr(false) }}
          onKeyDown={e => e.key === 'Enter' && unlock()}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${pinErr ? '#dc2626' : '#d1d5db'}`, marginBottom: 8, fontSize: 15, textAlign: 'center', boxSizing: 'border-box' }} />
        {pinErr && <p style={{ color: '#dc2626', fontSize: 13 }}>Incorrect PIN</p>}
        <button onClick={unlock} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>View Report →</button>
      </div>
    </div>
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
    ? { label: 'Suppressed', color: '#ef4444', text: 'Candidate may suppress natural intensity in this role. Monitor for frustration or disengagement.' }
    : euGap < -20
    ? { label: 'Overstretched', color: '#f97316', text: 'Role demands more than candidate\'s natural baseline. Monitor for fatigue.' }
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
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Export — {survey.candidate_name}</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Copy and save as a .json file. Paste into the Team Dashboard to add to comparisons.</p>
        <pre style={{ background: '#f3f4f6', padding: 16, borderRadius: 10, overflow: 'auto', fontSize: 12, marginBottom: 12 }}>{JSON.stringify({ candidate: survey.candidate_name, role: survey.role, completedAt: survey.completed_at, scores, profile: profile.name, fit, adminNotes: notes }, null, 2)}</pre>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={copyExport} style={{ ...Btn('#4f46e5'), flex: 1 }}>{copied ? '✓ Copied!' : 'Copy to Clipboard'}</button>
          <button onClick={() => setShowExport(false)} style={{ ...Btn('#e5e7eb'), flex: 1, color: '#374151' }}>← Back</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ ...pageStyle, paddingBottom: 48 }}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#374151', marginBottom: 4 }}>Admin Report — Confidential</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Candidate: {survey.candidate_name} · Role: {role.label} · Completed: {new Date(survey.completed_at).toLocaleDateString()}</p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 12 }}>
          <span style={{ fontSize: 36 }}>{profile.emoji}</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 2 }}>{profile.name}</h2>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>{profile.summary}</p>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{profile.description}</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: fitColor }}>{fit}%</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: fitColor }}>{fitLabel}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{role.label}</div>
          </div>
        </div>

        <Card title="Trait scores" compact>
          {mainTraits.map(t => {
            const v = scores[t.key]
            const ideal = role.idealTraits[t.key]
            const inRange = ideal && v >= ideal[0] && v <= ideal[1]
            return (
              <div key={t.key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{t.label}</span>
                  {ideal && <span style={{ fontSize: 12, color: '#6b7280' }}>Ideal: {ideal[0]}–{ideal[1]}</span>}
                </div>
                <div style={{ fontSize: 14, color: '#111827' }}>{v} · {traitLabel(v)}</div>
                {ideal && (
                  <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${v}%`, background: inRange ? '#22c55e' : barColor(v), transition: 'width 0.2s' }} />
                  </div>
                )}
              </div>
            )
          })}
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Green zone = ideal range for selected role</p>
        </Card>

        <Card title="⚡ Energy Unit Gap Analysis">
          <EUBox value={`${euGap >= 0 ? '+' : ''}${euGap}`} label={euStatus.label} color={euStatus.color} />
          <p style={{ marginTop: 8, fontSize: 14, color: '#374151' }}>{euStatus.text}</p>
        </Card>

        <Card title="Core Values">
          {valueTraits.map(v => {
            const val = scores[v.key]
            const w = role.coreValueWeights[v.key]
            const priority = w >= 1.4 ? 'Critical' : w >= 1.1 ? 'High' : 'Standard'
            const pColor = priority === 'Critical' ? '#dc2626' : priority === 'High' ? '#d97706' : '#9ca3af'
            return (
              <div key={v.key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: v.color }}>{v.label}</span>
                  <span style={{ fontWeight: 700 }}>{val}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{traitLabel(val)} · <span style={{ color: pColor }}>{priority} for role</span></div>
              </div>
            )
          })}
        </Card>

        <Card title="Strengths & Blind Spots">
          <div style={{ marginBottom: 12 }}>
            {profile.strengths.map((s, i) => <div key={i} style={{ marginBottom: 4 }}>✓ {s}</div>)}
          </div>
          <div>
            {profile.blindSpots.map((s, i) => <div key={i} style={{ marginBottom: 4 }}>✗ {s}</div>)}
          </div>
        </Card>

        <Card title="Management Playbook">
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
                ? ['Prefer verbal: call or live meeting over long written briefs', 'Lead with the headline — they\'ll ask for detail if needed', 'Put them in front of stakeholders — they shine in those settings']
                : ['Send detailed written briefs or docs before any meeting', 'Give processing time — don\'t demand immediate verbal answers', 'Use data and evidence to build trust and credibility'] },
            { bg: '#faf5ff', labelColor: '#7e22ce', label: 'Conflict & feedback approach',
              content: scores.conformity <= 45
                ? ['Be direct — this person respects candor over diplomacy', 'Frame feedback around impact: "When X happened, the outcome was Y"', 'Skip the compliment sandwich — it dilutes the message for them']
                : ['Use scheduled review sessions, not ad-hoc criticism', 'Lead with what\'s working before areas to improve', 'Follow up with written summaries so they can process independently'] },
          ].map((block, i) => (
            <div key={i} style={{ background: block.bg, padding: 12, borderRadius: 10, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: block.labelColor, marginBottom: 8 }}>{block.label}</div>
              {block.content.map((c, j) => <div key={j} style={{ marginBottom: 4, fontSize: 13 }}>→ {c}</div>)}
            </div>
          ))}
        </Card>

        <Card title="Role Fit Detail">
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>🚩 Red Flag for This Role</div>
            <p style={{ fontSize: 13, color: '#374151' }}>{role.redFlag}</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#374151', marginBottom: 8 }}>Key Qualities for This Role</div>
            {role.keyQualities.map((q, i) => <div key={i} style={{ marginBottom: 4 }}>{q}</div>)}
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 4 }}>Thrives in</div>
              {profile.thrivesIn.map((t, i) => <div key={i}>✓ {t}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#b45309', marginBottom: 4 }}>Struggles with</div>
              {profile.strugglesWith.map((t, i) => <div key={i}>✗ {t}</div>)}
            </div>
          </div>
        </Card>

        <Card title="Admin Notes">
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Add your own observations, interview notes, or context. Saved privately with this candidate's record.</p>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
            placeholder="e.g. Strong interview presence. Confirm alignment on long-term commitment before extending offer. Reference check outstanding..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }} />
          <button onClick={saveNotes} style={{ ...Btn('#4f46e5'), marginTop: 8 }}>{notesSaved ? '✓ Saved' : 'Save Notes'}</button>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setShowExport(true)} style={Btn('#4f46e5')}>📤 Export JSON</button>
          <button onClick={() => window.location.href = '/'} style={{ ...Btn('#e5e7eb'), color: '#374151' }}>← Admin Dashboard</button>
          <button onClick={() => window.location.href = '/team'} style={Btn('#1e3a5f')}>📊 Team Dashboard</button>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  )
}

function EUBox({ label, value, color }) {
  return (
    <div style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 10, background: color, color: 'white', fontWeight: 800, fontSize: 24, textAlign: 'center' }}>
      <div>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>{label}</div>
    </div>
  )
}

const Btn = bg => ({ padding: '10px 20px', borderRadius: 10, background: bg, color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' })
