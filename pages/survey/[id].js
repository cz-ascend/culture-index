import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { SECTIONS } from '../../lib/data'

const RADIO_OPTIONS = [
  { value: 0,  label: 'Strongly A' },
  { value: 25, label: 'Leaning A'  },
  { value: 50, label: 'Neutral'    },
  { value: 75, label: 'Leaning B'  },
  { value: 100,label: 'Strongly B' },
]

export default function SurveyPage() {
  const { query } = useRouter()
  const id = query.id
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [secIdx, setSecIdx] = useState(0)
  const [responses, setResponses] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('surveys').select('id,candidate_name,status').eq('id', id).single()
      .then(({ data }) => { setSurvey(data); if (data?.status === 'completed') setDone(true); setLoading(false) })
  }, [id])

  const sec = SECTIONS[secIdx]
  const totalQ = SECTIONS.reduce((s, x) => s + x.questions.length, 0)
  const answered = Object.keys(responses).length
  const secDone = sec?.questions.every(q => responses[q.id] !== undefined)
  const pageStyle = { minHeight: '100vh', background: '#f9fafb', padding: '20px 16px', fontFamily: 'system-ui, sans-serif' }
  const cardStyle = { background: 'white', borderRadius: 16, padding: 28, maxWidth: 640, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }

  const submit = async () => {
    setSubmitting(true)
    await fetch('/api/submit-survey', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, responses })
    })
    setDone(true)
    setSubmitting(false)
  }

  if (loading) return <div style={pageStyle}>Loading...</div>
  if (!survey) return <div style={pageStyle}>Survey not found.</div>
  if (done) return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Thank you, {survey.candidate_name}</h1>
        <p style={{ color: '#6b7280', fontSize: 15 }}>Your responses have been submitted. The team will be in touch with next steps.</p>
      </div>
    </div>
  )

  const progress = Math.round((answered / totalQ) * 100)

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontWeight: 700, color: '#374151' }}>{sec.title} of {SECTIONS.length}</span>
          <span style={{ fontSize: 14, color: '#6b7280' }}>{answered}/{totalQ} answered</span>
        </div>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#4f46e5', transition: 'width 0.2s' }} />
        </div>

        {sec.questions.map((q, i) => (
          <div key={q.id} style={{ marginBottom: 28 }}>
            <p style={{ fontWeight: 600, color: '#111827', marginBottom: 8 }}>{i + 1}. {q.text}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
              <span>{q.a}</span>
              <span>{q.b}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {RADIO_OPTIONS.map(opt => {
                const sel = responses[q.id] === opt.value
                return (
                  <button key={opt.value} onClick={() => setResponses(r => ({ ...r, [q.id]: opt.value }))}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: 8,
                      border: `2px solid ${sel ? '#4f46e5' : '#e5e7eb'}`,
                      background: sel ? '#eef2ff' : 'white',
                      cursor: 'pointer', fontSize: 11, fontWeight: sel ? 700 : 500,
                      color: sel ? '#4f46e5' : '#6b7280', transition: 'all 0.15s',
                      lineHeight: 1.3
                    }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button onClick={() => { setSecIdx(s => s - 1); window.scrollTo(0, 0) }} disabled={secIdx === 0}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#e5e7eb', color: '#374151', fontWeight: 600, cursor: secIdx === 0 ? 'not-allowed' : 'pointer', opacity: secIdx === 0 ? 0.4 : 1 }}>
            ← Back
          </button>
          {secIdx < SECTIONS.length - 1
            ? <button onClick={() => { setSecIdx(s => s + 1); window.scrollTo(0, 0) }} disabled={!secDone}
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: secDone ? '#4f46e5' : '#d1d5db', color: 'white', fontWeight: 600, cursor: secDone ? 'pointer' : 'not-allowed' }}>
                Next →
              </button>
            : <button onClick={submit} disabled={!secDone || submitting}
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: secDone ? '#4f46e5' : '#d1d5db', color: 'white', fontWeight: 600, cursor: secDone && !submitting ? 'pointer' : 'not-allowed' }}>
                {submitting ? 'Submitting...' : 'Submit Survey ✓'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}