
```jsx
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

  if (loading) return Loading...
  if (!survey) return Not found.
  if (survey.status !== 'completed') return (
    
      
        ⏳
        Survey not yet completed
        Candidate: {survey.candidate_name}
      
    
  )

  if (!authed) return (
    
      
        🔒
        Results for {survey.candidate_name}
        Enter your admin PIN to unlock the full report
        <input type="password" placeholder="Admin PIN" value={pin}
          onChange={e => { setPin(e.target.value); setPinErr(false) }}
          onKeyDown={e => e.key === 'Enter' && unlock()}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${pinErr ? '#dc2626' : '#d1d5db'}`, marginBottom: 8, fontSize: 15, textAlign: 'center', boxSizing: 'border-box' }} />
        {pinErr && Incorrect PIN}
        
          View Report →
        
      
    
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
    
      
        
          Export — {survey.candidate_name}
          Copy and save as a .json file. Paste into the Team Dashboard to add to comparisons.
          
            
              {JSON.stringify({ candidate: survey.candidate_name, role: survey.role, completedAt: survey.completed_at, scores, profile: profile.name, fit, adminNotes: notes }, null, 2)}
            
          
          
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            <button onClick={() => setShowExport(false)} style={{ ...Btn('#e5e7eb'), flex: 1, color: '#374151' }}>← Back
          
        
      
    
  )

  return (
    
      

        {/* Header */}
        
          Admin Report — Confidential
          Candidate: {survey.candidate_name} · Role: {role.label} · Completed: {new Date(survey.completed_at).toLocaleDateString()}
          
            {profile.emoji}
            
              {profile.name}
              {profile.summary}
              {profile.description}
            
            
              {fit}%
              {fitLabel}
              {role.label}
            
          
        

        {/* Trait bars */}
        
          {mainTraits.map(t => {
            const v = scores[t.key]
            const ideal = role.idealTraits[t.key]
            const inRange = ideal && v >= ideal[0] && v <= ideal[1]
            return (
              
                
                  {t.label}
                  
                    {ideal && Ideal: {ideal[0]}–{ideal[1]}}
                    
                      {v} · {traitLabel(v)}
                    
                  
                
                
                  {ideal && }
                  
                
              
            )
          })}
          Green zone = ideal range for selected role
        

        {/* EU Gap */}
        
          ⚡ Energy Unit Gap Analysis
          
            
            
             0 ? '+' : ''}${euGap}`} color={euStatus.color} />
          
          {euStatus.label}
          {euStatus.text}
        

        {/* Core Values */}
        
          
            {valueTraits.map(v => {
              const val = scores[v.key]
              const w = role.coreValueWeights[v.key]
              const priority = w >= 1.4 ? 'Critical' : w >= 1.1 ? 'High' : 'Standard'
              const pColor = priority === 'Critical' ? '#dc2626' : priority === 'High' ? '#d97706' : '#9ca3af'
              return (
                
                  
                    {v.label}
                    {val}
                  
                  
                    
                  
                  
                    {traitLabel(val)}
                    {priority} for role
                  
                
              )
            })}
          
        

        {/* Strengths & Blind Spots */}
        
          
            {profile.strengths.map((s, i) => ✓{s})}
          
          
            {profile.blindSpots.map((s, i) => !{s})}
          
        

        {/* Management Playbook */}
        
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
            
              {block.label}
              {block.content.map((c, j) => → {c})}
            
          ))}
        

        {/* Role Fit Detail */}
        
          
            🚩 Red Flag for This Role
            {role.redFlag}
          
          
            Key Qualities for This Role
            
              {role.keyQualities.map((q, i) => {q})}
            
          
          
            
              Thrives in
              {profile.thrivesIn.map((t, i) => ✓ {t})}
            
            
              Struggles with
              {profile.strugglesWith.map((t, i) => ✗ {t})}
            
          
        

        {/* Admin Notes */}
        
          
            Add your own observations, interview notes, or context. Saved privately with this candidate's record.
          
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
            placeholder="e.g. Strong interview presence. Confirm alignment on long-term commitment before extending offer. Reference check outstanding..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }} />
          
            {notesSaved ? '✓ Saved' : 'Save Notes'}
          
        

        {/* Actions */}
        
          <button onClick={() => setShowExport(true)} style={Btn('#4f46e5')}>📤 Export JSON
          <button onClick={() => window.location.href = '/'} style={{ ...Btn('#e5e7eb'), color: '#374151' }}>← Admin Dashboard
          <button onClick={() => window.location.href = '/team'} style={Btn('#1e3a5f')}>📊 Team Dashboard
        
      
    
  )
}

function Card({ title, children, compact }) {
  return (
    
      {title}
      {children}
    
  )
}

function EUBox({ label, value, color }) {
  return (
    
      {value}
      {label}
    
  )
}

const Btn = bg => ({ padding: '10px 20px', borderRadius: 10, background: bg, color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' })

function Wrap({ children, bg }) {
  return {children}
}
```
