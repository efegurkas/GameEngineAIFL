import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogOut, Cpu, Zap, Trophy, Radio } from 'lucide-react'

export default function Navbar({ connected }) {
  const { auth, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const links = [
    { to: '/dashboard',   label: 'PANEL',    Icon: Zap },
    { to: '/arena',       label: 'ARENA',    Icon: Radio },
    { to: '/leaderboard', label: 'LİDERLİK', Icon: Trophy },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 56,
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      background: scrolled ? 'rgba(5,7,9,.97)' : 'rgba(5,7,9,.88)',
      borderBottom: `1px solid ${scrolled ? '#1a2030' : 'rgba(26,32,48,.6)'}`,
      backdropFilter: 'blur(16px)',
      transition: 'background .3s, border-color .3s',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Logo */}
        <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(0,212,255,.15), rgba(0,212,255,.05))',
            border: '1px solid rgba(0,212,255,.3)',
            boxShadow: '0 0 12px rgba(0,212,255,.1)',
            transition: 'box-shadow .2s',
          }}>
            <Cpu size={15} color="#00d4ff" />
          </div>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 16, fontWeight: 700, letterSpacing: '0.22em', color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,.4)' }}>
            GOMOKU<span style={{ color: '#ffaa00' }}>·AI</span>
          </span>
        </NavLink>

        {/* Nav links */}
        {auth && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {links.map(({ to, label, Icon }) => {
              const active = location.pathname === to
              return (
                <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 4,
                    fontFamily: 'Rajdhani, sans-serif', fontSize: 12, letterSpacing: '0.18em',
                    color: active ? '#00d4ff' : '#708090',
                    background: active ? 'rgba(0,212,255,.08)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(0,212,255,.25)' : 'transparent'}`,
                    boxShadow: active ? '0 0 12px rgba(0,212,255,.08)' : 'none',
                    transition: 'all .2s ease',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#a0b8c8'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#708090'; e.currentTarget.style.background = 'transparent' } }}
                  >
                    <Icon size={12} />
                    {label}
                  </div>
                </NavLink>
              )
            })}
          </div>
        )}

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Connection pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20,
            background: connected ? 'rgba(0,255,136,.06)' : 'rgba(255,51,85,.06)',
            border: `1px solid ${connected ? 'rgba(0,255,136,.2)' : 'rgba(255,51,85,.2)'}`,
            transition: 'all .4s ease',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: connected ? '#00ff88' : '#ff3355',
              boxShadow: `0 0 8px ${connected ? '#00ff88' : '#ff3355'}`,
              animation: connected ? 'pulseDot 2s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: connected ? '#00ff88' : '#ff3355', letterSpacing: '0.12em' }}>
              {connected ? 'CANLI' : 'KESİK'}
            </span>
          </div>

          {auth && (
            <>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6080a0', opacity: .6 }}>
                {auth.team?.teamName}
              </span>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em',
                color: '#6080a0', background: 'none', border: 'none', cursor: 'pointer',
                opacity: .5, transition: 'opacity .2s, color .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ff3355' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = .5; e.currentTarget.style.color = '#6080a0' }}
              >
                <LogOut size={12} /> ÇIKIŞ
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}