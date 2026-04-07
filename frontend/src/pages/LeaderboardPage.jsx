import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import LeaderboardComponent from '../components/Leaderboard'
import { RefreshCw, Trophy } from 'lucide-react'

const DEMO = [
  { teamName: 'AlphaBot',   score: 42, played: 15, wins: 12, losses: 3 },
  { teamName: 'NeuralNova', score: 38, played: 14, wins: 11, losses: 3 },
  { teamName: 'DeepStone',  score: 30, played: 13, wins: 9,  losses: 4 },
  { teamName: 'ZeroMind',   score: 22, played: 12, wins: 7,  losses: 5 },
  { teamName: 'GridRunner', score: 14, played: 10, wins: 4,  losses: 6 },
]

export default function LeaderboardPage() {
  const { auth }   = useAuth()
  const [teams, setTeams]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [spinning, setSpinning] = useState(false)

  const fetchTeams = async () => {
    setLoading(true); setSpinning(true)
    try {
      const res = await fetch('/api/teams', { headers: { Authorization: `Bearer ${auth?.token}` } })
      setTeams(res.ok ? await res.json() : DEMO)
    } catch { setTeams(DEMO) }
    finally {
      setLoading(false)
      setLastRefresh(new Date().toLocaleTimeString('tr', { hour12: false }))
      setTimeout(() => setSpinning(false), 400)
    }
  }

  useEffect(() => { fetchTeams() }, [])

  return (
    <div className="page-enter" style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #ffaa00, rgba(255,170,0,.2))', boxShadow: '0 0 10px #ffaa00' }} />
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '0.18em' }}>LİDERLİK TABLOSU</h1>
          <Trophy size={18} color="rgba(255,170,0,.4)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {lastRefresh && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .3 }}>
              Son güncelleme: {lastRefresh}
            </span>
          )}
          <button onClick={fetchTeams} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em',
            background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 6,
            color: '#6080a0', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all .2s ease',
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'rgba(0,212,255,.25)'; e.currentTarget.style.color = '#00d4ff' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a2030'; e.currentTarget.style.color = '#6080a0' }}
          >
            <RefreshCw size={11} style={{ animation: spinning ? 'spinFull .4s linear' : 'none' }} />
            YENİLE
          </button>
        </div>
      </div>

      {/* Top 3 podium */}
      {teams.length >= 3 && (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[1, 0, 2].map((rank, col) => {
            const team = [...teams].sort((a, b) => b.score - a.score)[rank]
            if (!team) return null
            const colors = ['#ffaa00','#b0b8c8','#cd7f32']
            const heights = [88, 108, 72]
            const color = colors[rank]
            return (
              <div key={rank} style={{
                background: `linear-gradient(180deg, ${color}0a, transparent)`,
                border: `1px solid ${color}22`, borderRadius: 8,
                padding: '16px 12px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}15` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: col === 1 ? 28 : 22 }}>{'🥇🥈🥉'[rank]}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.06em' }}>{team.teamName}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: col === 1 ? 26 : 20, fontWeight: 700, color, textShadow: `0 0 12px ${color}55` }}>{team.score}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: .35 }}>PUAN</div>
              </div>
            )
          })}
        </div>
      )}

      {loading && teams.length === 0 ? (
        <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, padding: 48, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, opacity: .3 }}>
          Yükleniyor...
        </div>
      ) : (
        <LeaderboardComponent teams={teams} />
      )}
    </div>
  )
}