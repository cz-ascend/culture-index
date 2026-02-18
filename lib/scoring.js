import { SECTIONS, PROFILES, ROLES, A_HIGH_IDS, REVERSE_DIMS } from './data'

export function calcScores(responses) {
  const out = {}
  SECTIONS.forEach(sec => {
    let total = 0, count = 0
    sec.questions.forEach(q => {
      if (responses[q.id] === undefined) return
      let v = responses[q.id]
      if (REVERSE_DIMS.has(sec.id)) v = 100 - v
      else if (A_HIGH_IDS.has(q.id)) v = 100 - v
      total += v; count++
    })
    out[sec.id] = count ? Math.round(total / count) : 50
  })
  return out
}

export function fitScore(scores, roleKey) {
  const ideal = ROLES[roleKey].idealTraits
  const dims = Object.keys(ideal)
  let total = 0
  dims.forEach(dim => {
    const [lo, hi] = ideal[dim]
    const v = scores[dim] ?? 50
    const mid = (lo + hi) / 2, half = (hi - lo) / 2
    const dist = Math.max(0, Math.abs(v - mid) - half)
    total += Math.max(0, 100 - dist * 2)
  })
  return Math.round(total / dims.length)
}

export function getProfile(scores) {
  for (const p of PROFILES) if (p.match(scores)) return p
  const dom = Object.entries({
    autonomy: scores.autonomy, social: scores.social,
    patience: scores.patience, conformity: scores.conformity
  }).sort((a, b) => b[1] - a[1])[0][0]
  return dom === "autonomy" ? PROFILES[0] : dom === "social" ? PROFILES[2]
    : dom === "conformity" ? PROFILES[1] : PROFILES[3]
}

export function traitLabel(v) {
  return v >= 70 ? "Very High" : v >= 58 ? "High" : v >= 42 ? "Moderate" : v >= 30 ? "Low" : "Very Low"
}

export function barColor(v) {
  return v >= 65 ? "#6366f1" : v >= 45 ? "#8b5cf6" : "#f59e0b"
}

