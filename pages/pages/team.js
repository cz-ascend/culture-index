
```jsx
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

  return (
    
      

        {/* Header */}
        
          
            Team Comparison Dashboard
            Paste JSON exports from individual result pages to compare candidates side by side
          
          <button onClick={() => window.location.href = '/'} style={{ padding: '8px 20px', borderRadius: 10, background: '#e5e7eb', color: '#374151', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>← Admin
        

        {/* Add candidate */}
        
          Add Candidate
          <textarea value={raw} onChange={e => { setRaw(e.target.value); setParseErr('') }} rows={4}
            placeholder='Paste the JSON export from a candidate\'s results page here...'
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${parseErr ? '#dc2626' : '#d1d5db'}`, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }} />
          {parseErr && {parseErr}}
          
            Add to Dashboard
          
        

        {candidates.length === 0 && (
          
            👥
            No candidates yet
            Export JSON from individual results pages and paste above
          
        )}

        {candidates.length > 0 && (
          <>
            {/* Candidate cards */}
            
              {candidates.map(c => {
                const fitColor = c.fit >= 75 ? '#22c55e' : c.fit >= 55 ? '#f59e0b' : '#ef4444'
                const pColor = profileColors[c.profile] || '#6b7280'
                return (
                  <div key={c.candidate} onClick={() => setSelected(selected?.candidate === c.candidate ? null : c)}
                    style={{ background: 'white', borderRadius: 12, padding: 18, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `2px solid ${selected?.candidate === c.candidate ? '#4f46e5' : 'transparent'}`, transition: 'border 0.15s' }}>
                    
                      
                        {c.candidate}
                        {ROLES[c.role]?.label || c.role}
                      
                      <button onClick={e => { e.stopPropagation(); remove(c.candidate) }}
                        style={{ fontSize: 16, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>×
                    
                    {c.profile}
                    
                      Role Fit
                      {c.fit}%
                    
                  
                )
              })}
            

            {/* Comparison matrix */}
            
              Trait Comparison Matrix
              
                
                  
                    Dimension
                    {candidates.map(c => (
                      
                        {c.candidate}
                        {ROLES[c.role]?.icon} {ROLES[c.role]?.label}
                      
                    ))}
                  
                
                
                  {[...DIMS, 'divider', ...VALUES].map((dim, ri) => {
                    if (dim === 'divider') return (
                      
                        Core Values
                      
                    )
                    const vals = candidates.map(c => c.scores[dim] ?? 0)
                    const maxVal = Math.max(...vals)
                    const minVal = Math.min(...vals)
                    const spread = maxVal - minVal
                    return (
                      <tr key={dim} style={{ background: ri % 2 === 0 ? '#f9fafb' : 'white' }}>
                        {DIM_LABELS[dim]}
                        {candidates.map(c => {
                          const v = c.scores[dim] ?? 0
                          const isMax = v === maxVal && spread > 0
                          const isMin = v === minVal && spread > 0
                          return (
                            
                              
                                {v}
                                
                                  
                                
                                {traitLabel(v)}
                                {spread > 30 && {isMax ? '▲ High' : isMin ? '▼ Low' : ''}}
                              
                            
                          )
                        })}
                      
                    )
                  })}
                
              
              {candidates.length >= 2 && (
                
                  ⚠️ Large Gaps (30+ points)
                  {DIMS.concat(VALUES).map(dim => {
                    const vals = candidates.map(c => ({ name: c.candidate, v: c.scores[dim] ?? 0 }))
                    const spread = Math.max(...vals.map(x => x.v)) - Math.min(...vals.map(x => x.v))
                    if (spread < 30) return null
                    const hi = vals.sort((a, b) => b.v - a.v)[0]
                    const lo = [...vals].sort((a, b) => a.v - b.v)[0]
                    return • {DIM_LABELS[dim]}: {hi.name} ({hi.v}) vs {lo.name} ({lo.v}) — {spread} pt gap. Manage communication style accordingly.
                  })}
                
              )}
            

            {/* Team dynamics */}
            {candidates.length >= 2 && (
              
                Team Dynamics & Pairing Insights
                
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
                      
                        {ins.label}
                        {ins.text}
                      
                    ))
                  })()}
                
              
            )}

            {/* Selected candidate detail */}
            {selected && (
              
                Spotlight: {selected.candidate}
                Profile: {selected.profile} · Role: {ROLES[selected.role]?.label} · Fit: = 75 ? '#22c55e' : selected.fit >= 55 ? '#f59e0b' : '#ef4444' }}>{selected.fit}%
                {[...DIMS, ...VALUES].map(dim => {
                  const v = selected.scores[dim] ?? 0
                  return (
                    
                      
                        {DIM_LABELS[dim]}
                        {v} · {traitLabel(v)}
                      
                      
                        
                      
                    
                  )
                })}
                {selected.adminNotes && (
                  
                    📝 Admin Notes
                    {selected.adminNotes}
                  
                )}
              
            )}
          </>
        )}
      
    
  )
}
```
