import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { SECTIONS } from '../../lib/data'

const RADIO_OPTIONS = [
  { value: 0,   label: 'Strongly A' },
  { value: 25,  label: 'Leaning A'  },
  { value: 50,  label: 'Neutral'    },
  { value: 75,  label: 'Leaning B'  },
  { value: 100, label: 'Strongly B' },
]

export default function SurveyPage() {
  const { query, isReady } = useRouter()
  const id = query.id
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [secIdx, setSecIdx] = useState(0)
  const [responses, setResponses] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!isReady || !id) return
    fetch(`/api/get-survey?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setSurvey(data)
        if (data.status === 'completed') setDone(true)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [isReady, id])

  const sec = SECTIONS[secIdx]
  const totalQ = SECTIONS.reduce((s, x) => s + x.questions.length, 0)
  const answered = Object.keys(responses).length
  const secDone = sec?.questions.every(q => responses[q.id] !== undefined)

  const submit = async () => {
    setSubmitting(true)
    try {
      const r = await fetch('/api/submit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, responses })
      })
      const data = await r.json()
      if (!r.ok) { setError(data.error || 'Submission failed'); setSubmitting(false); return }
      setDone(true)
    } catch (e) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  if (loading) return <Wrap><p style={{ padding: 40, color: '#6b7280', textAlign: 'center' }}>Loading survey...</p></Wrap>
  if (error) return <Wrap><div style={{ padding: 40, textAlign: 'center' }}><p style={{ color: '#dc2626', fontWeight: 600 }}>Error: {error}</p><p style={{ color: '#6b7280', fontSize: 14 }}>Please contact the person who sent you this link.</p></div></Wrap>
  if (!survey) return <Wrap><p style={{ padding: 40, color: '#6b7280', textAlign: 'center' }}>Survey not found.</p></Wrap>
  if (done) return (
    <Wrap>
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Thank you, {survey.candidate_name}</h2>
        <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 360, margin: '0 auto' }}>
          Your responses have been submitted. The team will be in touch with next steps.
        </p>
      </div>
    </Wrap>
  )

  const progress = Math.round((answered / totalQ) * 100)

  return (
    <Wrap>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
            <span>{sec.title} of {SECTIONS.length}</span>
            <span>{answered}/{totalQ} answered</span>
          </div>
          <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3 }}>
            <div style={{ height: 6, background: '#4f46e5', borderRadius: 3, width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Questions */}
        {sec.questions.map((q, i) => (
          <div key={q.id} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 16 }}>
              {i + 1}. {q.text}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6b7280', maxWidth: '38%', lineHeight: 1.4 }}>{q.a}</span>
              <span style={{ fontSize: 12, color: '#6b7280', maxWidth: '38%', textAlign: 'right', lineHeight: 1.4 }}>{q.b}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
              {RADIO_OPTIONS.map(opt => {
                const sel = responses[q.id] === opt.value
                return (
                  <button key={opt.value} onClick={() => setResponses(r => ({ ...r, [q.id]: opt.value }))}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: 8,
                      border: `2px solid ${sel ? '#4f46e5' : '#e5e7eb'}`,
                      background: sel ? '#eef2ff' : 'white',
                      cursor: 'pointer', fontSize: 11, fontWeight: sel ? 700 : 500,
                      color: sel ? '#4f46e5' : '#6b7280', transition: 'all 0.15s', lineHeight: 1.3
                    }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
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
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: secDone ? '#059669' : '#d1d5db', color: 'white', fontWeight: 600, cursor: secDone ? 'pointer' : 'not-allowed' }}>
                {submitting ? 'Submitting...' : 'Submit Survey ✓'}
              </button>
          }
        </div>
      </div>
    </Wrap>
  )
}

function Wrap({ children }) {
  return <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex', justifyContent: 'center' }}>{children}</div>
}