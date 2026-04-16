'use client'
import { useState } from 'react'
import Link from 'next/link'

const steps = [
  { num: '01', title: 'Fill out the form', desc: 'Tell us about your company and goals.' },
  { num: '02', title: 'We review & prep', desc: 'We audit your AI citation presence before the call.' },
  { num: '03', title: 'Free strategy session', desc: '45-min call — real insights, no sales pressure.' },
  { num: '04', title: 'Get your action plan', desc: 'Walk away with a clear AEO roadmap, free.' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', website: '', goal: '', message: '' })
  const [sent, setSent] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = e => {
    e.preventDefault()
    // In production: send to your API / Formspree / etc.
    setSent(true)
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#E8E4DC', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'border-color 0.2s',
  }
  const labelStyle = { fontSize: '0.82rem', fontWeight: 600, color: '#8A96B0', display: 'block', marginBottom: '8px', letterSpacing: '0.02em' }

  return (
    <>
      <section style={{ minHeight: '100vh', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '400px', background: 'radial-gradient(circle,rgba(242,168,59,0.1) 0%,transparent 65%)', top: 0, left: '50%', transform: 'translateX(-50%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '72px', alignItems: 'start' }} className="contact-grid">

            {/* Left */}
            <div>
              <span className="badge" style={{ marginBottom: '20px' }}>Free Strategy Session</span>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.2rem,4vw,3.2rem)', color: '#fff', marginBottom: '18px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Let's Get Your Brand <em className="gold-text">Cited by AI</em>
              </h1>
              <p style={{ color: 'var(--muted)', lineHeight: 1.78, fontWeight: 300, marginBottom: '40px', fontSize: '1rem' }}>
                Book a free 45-minute AEO strategy session. We'll audit your AI citation presence live on the call and give you a clear, actionable roadmap — no commitment required.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '20px', paddingBottom: '24px', marginBottom: i < steps.length-1 ? '0' : '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(242,168,59,0.1)', border: '1px solid rgba(242,168,59,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>{s.num}</div>
                      {i < steps.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: '8px' }} />}
                    </div>
                    <div style={{ paddingBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{s.title}</h4>
                      <p style={{ fontSize: '0.83rem', color: 'var(--muted)', fontWeight: 300 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', padding: '20px', background: 'rgba(242,168,59,0.06)', border: '1px solid rgba(242,168,59,0.2)', borderRadius: '10px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 300, lineHeight: 1.65 }}>
                  <strong style={{ color: '#fff', fontWeight: 600 }}>Not ready for a call?</strong> Email us directly at{' '}
                  <a href="mailto:hello@aeorank.tech" style={{ color: 'var(--gold)', textDecoration: 'none' }}>hello@aeorank.tech</a>
                </p>
              </div>
            </div>

            {/* Form */}
            <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '44px' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', color: '#fff', marginBottom: '12px' }}>You're booked!</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>We'll review your site before the call and reach out within 24 hours to confirm your session.</p>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', color: '#fff', marginBottom: '6px' }}>Book Your Free Session</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '32px', fontWeight: 300 }}>Takes 2 minutes. No credit card needed.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Your Name *</label>
                      <input name="name" required value={form.name} onChange={handle} placeholder="Alex Johnson" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(242,168,59,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Work Email *</label>
                      <input name="email" type="email" required value={form.email} onChange={handle} placeholder="you@company.com" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(242,168,59,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Company *</label>
                      <input name="company" required value={form.company} onChange={handle} placeholder="Acme SaaS" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(242,168,59,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Website *</label>
                      <input name="website" required value={form.website} onChange={handle} placeholder="acme.com" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(242,168,59,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>What's your main AEO goal? *</label>
                    <select name="goal" required value={form.goal} onChange={handle} style={{ ...inputStyle, appearance: 'none' }}>
                      <option value="">Select a goal...</option>
                      <option value="citations">Get cited by ChatGPT / Perplexity</option>
                      <option value="google-ai">Appear in Google AI Overviews</option>
                      <option value="competitor">Outrank competitors in AI answers</option>
                      <option value="pipeline">Drive more AI-sourced pipeline</option>
                      <option value="audit">Just want an audit first</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '28px' }}>
                    <label style={labelStyle}>Anything else we should know?</label>
                    <textarea name="message" value={form.message} onChange={handle} rows={4} placeholder="Tell us about your current situation, budget range, timeline, or any specific questions..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor = 'rgba(242,168,59,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                  </div>

                  <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '15px' }}>
                    Book My Free AEO Session →
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '14px', fontWeight: 300 }}>
                    We'll confirm within 24 hours. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </>
  )
}
