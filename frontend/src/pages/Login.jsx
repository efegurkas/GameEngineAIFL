import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Cpu, Eye, EyeOff, AlertCircle, ChevronRight } from 'lucide-react'

export default function Login() {
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [mounted, setMounted]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamName, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Giriş başarısız')
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050709', position: 'relative', overflow: 'hidden' }}>

      {/* Animated grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(0,212,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,.035) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
        animation: 'fadeIn 1s ease forwards',
      }} />

      {/* Corner decorations */}
      {[['top:24px;left:24px', 'border-top:2px solid;border-left:2px solid'],
        ['top:24px;right:24px', 'border-top:2px solid;border-right:2px solid'],
        ['bottom:24px;left:24px', 'border-bottom:2px solid;border-left:2px solid'],
        ['bottom:24px;right:24px', 'border-bottom:2px solid;border-right:2px solid'],
      ].map(([pos, border], i) => (
        <div key={i} style={{
          position: 'absolute', width: 40, height: 40,
          ...Object.fromEntries(pos.split(';').map(s => { const [k,v] = s.split(':'); return [k, v] })),
          ...Object.fromEntries(border.split(';').map(s => { const [k,...v] = s.split(':'); return [k.replace(/-([a-z])/g, (_,c) => c.toUpperCase()), v.join(':') + ' rgba(0,212,255,.2)'] })),
          opacity: 0,
          animation: `fadeIn .6s ease ${.1 * i + .4}s forwards`,
        }} />
      ))}

      {/* Ambient glow orb */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(circle, rgba(0,212,255,.05) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 380, margin: '0 16px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(20px)',
        transition: 'opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 12, marginBottom: 16,
            background: 'rgba(0,212,255,.07)',
            border: '1px solid rgba(0,212,255,.2)',
            boxShadow: '0 0 40px rgba(0,212,255,.12), inset 0 1px 0 rgba(255,255,255,.05)',
            animation: 'pulseDot 3s ease-in-out infinite',
          }}>
            <Cpu size={30} color="#00d4ff" />
          </div>
          <h1 style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: 36, fontWeight: 700,
            color: '#00d4ff', letterSpacing: '0.28em',
            textShadow: '0 0 30px rgba(0,212,255,.6)',
            lineHeight: 1,
          }}>GOMOKU</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .35, letterSpacing: '0.3em', marginTop: 6 }}>
            AI ARENA · GİRİŞ
          </p>
        </div>

        {/* Form card */}
        <div className="bracket" style={{
          background: '#0c0f14',
          border: '1px solid #1a2030',
          borderRadius: 8,
          padding: 32,
          boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Team name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em', opacity: .45, marginBottom: 8 }}>
                TAKIM ADI
              </label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required autoFocus
                placeholder="team_alpha"
                className="input-glow"
                style={{
                  width: '100%', padding: '12px 16px',
                  background: '#070a0e', border: '1px solid #1a2030', borderRadius: 5,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e2e8f0',
                  caretColor: '#00d4ff', transition: 'border-color .2s, box-shadow .2s',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em', opacity: .45, marginBottom: 8 }}>
                ŞİFRE
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-glow"
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px',
                    background: '#070a0e', border: '1px solid #1a2030', borderRadius: 5,
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e2e8f0',
                    caretColor: '#00d4ff', transition: 'border-color .2s, box-shadow .2s',
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6080a0',
                  opacity: .5, transition: 'opacity .15s', display: 'flex',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = .5}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="slide-up" style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                padding: '10px 14px', borderRadius: 5,
                background: 'rgba(255,51,85,.07)', border: '1px solid rgba(255,51,85,.2)',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#ff3355',
              }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.22em',
              background: loading ? 'rgba(0,212,255,.08)' : 'rgba(0,212,255,.12)',
              border: `1px solid rgba(0,212,255,${loading ? '.15' : '.35'})`,
              borderRadius: 5, color: '#00d4ff', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 24px rgba(0,212,255,.12)',
              transition: 'all .2s ease',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(0,212,255,.2)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(0,212,255,.2)' } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,255,.12)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,.12)' }}
            >
              {loading ? (
                <span style={{ opacity: .6 }}>BAĞLANIYOR...</span>
              ) : (
                <><span>GİRİŞ YAP</span><ChevronRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .2 }}>
          Erişim için yöneticiye başvurun
        </p>
      </div>
    </div>
  )
}