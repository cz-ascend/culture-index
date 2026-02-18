import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ROLES } from '../lib/data'

const PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinErr, setPinErr] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'investment', adminEmail: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  if (!authed) return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.h1}>Culture Index</h1>
        <p style={S.sub}>Admin access</p>
        <input style={S.input} type="password" placeholder="Enter admin PIN"
          value={pin} onChange={e => { setPin(e.target.value); setPinErr(false) }}
          onKeyDown={e => e.key === 'Enter' && (pin === PIN ? setAuthed(true) : setPinErr(true))} />
        <button style={S.btn} onClick={() => pin === PIN ? setAuthed(true) : setPinErr(true)}>Enter</button>
        {pinErr && <p style={S.err}>Incorrect PIN</p>}
      </div>
    </div>
  )

  const create = async () => {
    if (!form.name || !form.email || !form.adminEmail) { setErr('All fields required'); return }
    setLoading(true); setErr(''); setResult(null)
    const id = uuidv4()
    const res = await fetch('/api/create-survey', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form })
    })
    const data = await res.json()
    if (!res.ok) { setErr(data.error || 'Something went wrong'); setLoading(false); return }
    setResult(data)
    setForm({ name: '', email: '', role: 'investment', adminEmail: form.adminEmail })
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <div style={{ ...S.card, maxWidth: 520 }}>
        <h1 style={S.h1}>Culture Index — Admin</h1>
        <p style={S.sub}>Create a unique survey link for each candidate</p>
        <label style={S.label}>Candidate Name</label>
        <input style={S.input} placeholder="e.g. Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <label style={S.label}>Candidate Email</label>
        <input style={S.input} type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <label style={S.label}>Your Email (results sent here)</label>
        <input style={S.input} type="email" placeholder="you@yourfirm.com" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} />
        <label style={S.label}>Target Role</label>
        <div style={{ marginBottom: 20 }}>
          {Object.entries(ROLES).map(([k, r]) => (
            <button key={k} onClick={() => setForm({ ...form, role: k })}
              style={{ ...S.roleBtn, ...(form.role === k ? S.roleBtnActive : {}) }}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>
        <button style={S.btn} onClick={create} disabled={loading}>
          {loading ? 'Creating...' : 'Create Survey Link →'}
        </button>
        {err && <p style={S.err}>{err}</p>}
        {result && (
          <div style={S.success}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>✅ Survey created!</p>
            <p style={{ fontSize: 13, marginBottom: 12, wordBreak: 'break-all' }}>{result.surveyUrl}</p>
            <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>An invite email has been sent to the candidate. You'll receive the results link when they complete the survey.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...S.btn, flex: 1, background: '#059669', padding: '8px 0', fontSize: 13 }}
                onClick={() => navigator.clipboard.writeText(result.surveyUrl)}>Copy Survey Link</button>
              <button style={{ ...S.btn, flex: 1, background: '#1e3a5f', padding: '8px 0', fontSize: 13 }}
                onClick={() => window.open(result.resultsUrl)}>Preview Results Page</button>
            </div>
          </div>
        )}
        <button style={{ ...S.btn, background: '#1e3a5f', fontSize: 13, marginTop: 12 }}
          onClick={() => window.location.href = '/team'}>
          📊 Team Comparison Dashboard →
        </button>
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#f9fafb', display: 'flex', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px 16px' },
  card: { background: 'white', borderRadius: 16, padding: 36, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  h1: { fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', marginBottom: 14, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px 0', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  err: { color: '#dc2626', fontSize: 13, marginTop: 8 },
  roleBtn: { display: 'inline-block', margin: '0 8px 8px 0', padding: '8px 16px', borderRadius: 20, border: '2px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' },
  roleBtnActive: { border: '2px solid #4f46e5', background: '#eef2ff', color: '#4f46e5', fontWeight: 700 },
  success: { marginTop: 20, padding: 16, background: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac' },
}
