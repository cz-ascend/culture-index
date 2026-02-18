import { useState } from 'react'
import { ROLES } from '../lib/data'
import { traitLabel, barColor } from '../lib/scoring'

const DIMS = ['autonomy', 'social', 'patience', 'conformity', 'energy']
const VALUES = ['integrity', 'humility', 'grit', 'learning']
const DIM_LABELS = { autonomy: 'A — Autonomy', social: 'B — Social', patience: 'C — Patience', conformity: 'D — Conformity', energy: 'EU — Energy', integrity: 'Integrity', humility: 'Humility', grit: 'Grit', learning: 'Learning' }

export default function TeamPage() {
  const [candidates, setCandidates] = useState([])
  const [raw, setRaw] = useState('')
  const [parseErr, setParseErr] = useState('')
  const [selected, setSelected] = useState(null)

  const addCandidate = () => {
    setParseErr('')
    try {
      const parsed = JSON.parse(raw.trim())
      if (!parsed.candidate || !parsed.scores) throw new Error('Invalid format — paste exported JSON from the results page')
      if (candidates.find(c => c.candidate === parsed.candidate)) throw new Error('Candidate already added')
      setCandidates(c => [...c, parsed])
      setRaw('')
    } catch (e) {
      setParseErr(e.message)
    }
  }

  const remove = name => setCandidates(c => c.filter(x => x.candidate !== name))

  const profileColors = { 'The Enterpriser': '#ef4444', 'The Analyst': '#6366f1', 'The Collaborator': '#22c55e', 'The Operator': '#f59e0b', 'The Catalyst': '#8b5cf6' }

  const pageStyle = { minHeight: '100vh', background: '#f9fafb', padding: 20, fontFamily: 'system-ui, sans-serif' }
  const cardStyle = { background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Team Comparison Dashboard</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Paste JSON exports from individual result pages to compare candidates side by side</p>
          </div>
          <button onClick={() => window.location.href = '/'} style={{ padding: '8px 20px', borderRadius: 10, background: '#e5e7eb', color: '#374151', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>← Admin</button>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Add Candidate</h2>
        <textarea value={raw} onChange={e => { setRaw(e.target.value); setParseErr('') }} rows={4}
          placeholder={"Paste the JSON export from a candidate's results page here..."}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${parseErr ? '#dc2626' : '#d1d5db'}`, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }} />
        {parseErr && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{parseErr}</p>}
        <button onClick={addCandidate} style={{ marginTop: 8, padding: '10px 20px', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Add to Dashboard</button>
      </div>

      {candidates.length === 0 && (
        <div style={cardStyle}>
          <p style={{ fontSize: 48, marginBottom: 8 }}>👥</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 4 }}>No candidates yet</h2>
          <p style={{ color: '#6b7280' }}>Export JSON from individual results pages and paste above</p>
        </div>
      )}

      {candidates.length > 0 && (
        <>
          <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {candidates.map(c => {
              const fitColor = c.fit >= 75 ? '#22c55e' : c.fit >= 55 ? '#f59e0b' : '#ef4444'
              const pColor = profileColors[c.profile] || '#6b7280'
              return (
                <div key={c.candidate} onClick={() => setSelected(selected?.candidate === c.candidate ? null : c)}
                  style={{ background: 'white', borderRadius: 12, padding: 18, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `2px solid ${selected?.candidate === c.candidate ? '#4f46e5' : 'transparent'}`, transition: 'border 0.15s', minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{c.candidate}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{ROLES[c.role]?.label || c.role}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); remove(c.candidate) }}
                      style={{ fontSize: 16, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>×</button>
                  </div>
                  <div style={{ fontSize: 13, color: pColor, marginTop: 4 }}>{c.profile}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>Role Fit</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: fitColor }}>{c.fit}%</div>
                </div>
              )
            })}
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Trait Comparison Matrix</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6b7280', fontWeight: 600 }}>Dimension</th>
                    {candidates.map(c => (
                      <th key={c.candidate} style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600, color: '#374151' }}>
                        <div>{c.candidate}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{ROLES[c.role]?.icon} {ROLES[c.role]?.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...DIMS, 'divider', ...VALUES].map((dim, ri) => {
                    if (dim === 'divider') return (
                      <tr key="divider">
                        <td colSpan={candidates.length + 1} style={{ padding: '8px 12px', background: '#f3f4f6', fontWeight: 700, color: '#374151' }}>Core Values</td>
                      </tr>
                    )
                    const vals = candidates.map(c => c.scores[dim] ?? 0)
                    const maxVal = Math.max(...vals)
                    const minVal = Math.min(...vals)
                    const spread = maxVal - minVal
                    return (
                      <tr key={dim} style={{ background: ri % 2 === 0 ? '#f9fafb' : 'white' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 500, color: '#374151' }}>{DIM_LABELS[dim]}</td>
                        {candidates.map(c => {
                          const v = c.scores[dim] ?? 0
                          const isMax = v === maxVal && spread > 0
                          const isMin = v === minVal && spread > 0
                          return (
                            <td key={c.candidate} style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 600 }}>{v}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{traitLabel(v)}</div>
                              {spread > 30 && <div style={{ fontSize: 11, color: isMax ? '#15803d' : isMin ? '#b45309' : 'transparent' }}>{isMax ? '▲ High' : isMin ? '▼ Low' : ''}</div>}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {candidates.length >= 2 && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>⚠️ Large Gaps (30+ points)</h3>
              {DIMS.concat(VALUES).map(dim => {
                const vals = candidates.map(c => ({ name: c.candidate, v: c.scores[dim] ?? 0 }))
                const spread = Math.max(...vals.map(x => x.v)) - Math.min(...vals.map(x => x.v))
                if (spread < 30) return null
                const sorted = [...vals].sort((a, b) => b.v - a.v)
                const hi = sorted[0]
                const lo = sorted[sorted.length - 1]
                return <div key={dim} style={{ marginBottom: 8, fontSize: 14 }}>• {DIM_LABELS[dim]}: {hi.name} ({hi.v}) vs {lo.name} ({lo.v}) — {spread} pt gap. Manage communication style accordingly.</div>
              })}
            </div>
          )}

          {candidates.length >= 2 && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Team Dynamics & Pairing Insights</h3>
              {(() => {
                const insights = []
                const highA = candidates.filter(c => (c.scores.autonomy ?? 0) >= 65)
                const highC = candidates.filter(c => (c.scores.patience ?? 0) >= 65)
                const highB = candidates.filter(c => (c.scores.social ?? 0) >= 65)
                const highD = candidates.filter(c => (c.scores.conformity ?? 0) >= 65)
                if (highA.length >= 2) insights.push({ color: '#fef2f2', label: '⚠️ Multiple High-Autonomy profiles', text: `${highA.map(c => c.candidate).join(', ')} all score high on Autonomy. Risk of role overlap or internal competition. Define clear ownership boundaries.` })
                if (highA.length > 0 && highD.length > 0) insights.push({ color: '#f0fdf4', label: '✅ Balanced leadership + execution', text: `${highA.map(c => c.candidate).join(', ')} (drivers) + ${highD.map(c => c.candidate).join(', ')} (operators) — a complementary pairing. Use the operators to build processes the drivers can scale.` })
                if (highB.length > 0 && highB.length < candidates.length) insights.push({ color: '#eff6ff', label: '💡 Mix of communicators vs. analytical thinkers', text: `${highB.map(c => c.candidate).join(', ')} prefer verbal/social communication. Others prefer written. Set a shared protocol: key decisions in writing, brainstorms in person.` })
                if (highC.length > 0 && highA.length > 0) insights.push({ color: '#faf5ff', label: '⚡ Pace mismatch risk', text: `${highA.map(c => c.candidate).join(', ')} move fast; ${highC.map(c => c.candidate).join(', ')} prefer depth. Build in explicit alignment check-ins before major decisions to avoid frustration.` })
                if (insights.length === 0) insights.push({ color: '#f8fafc', label: '📊 Profile looks balanced', text: 'No major friction points detected across the current team. Continue monitoring as team scales.' })
                return insights.map((ins, i) => (
                  <div key={i} style={{ background: ins.color, padding: 12, borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{ins.label}</div>
                    <div style={{ fontSize: 13, color: '#374151' }}>{ins.text}</div>
                  </div>
                ))
              })()}
            </div>
          )}

          {selected && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Spotlight: {selected.candidate}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Profile: {selected.profile} · Role: {ROLES[selected.role]?.label} · Fit: <span style={{ color: selected.fit >= 75 ? '#22c55e' : selected.fit >= 55 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>{selected.fit}%</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {[...DIMS, ...VALUES].map(dim => {
                  const v = selected.scores[dim] ?? 0
                  return (
                    <div key={dim} style={{ padding: 10, background: '#f9fafb', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{DIM_LABELS[dim]}</div>
                      <div style={{ fontWeight: 700 }}>{v} · {traitLabel(v)}</div>
                    </div>
                  )
                })}
              </div>
              {selected.adminNotes && (
                <div style={{ marginTop: 16, padding: 12, background: '#fffbeb', borderRadius: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>📝 Admin Notes</div>
                  <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{selected.adminNotes}</div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
