import React, { useState } from 'react'
import { Trophy, Cpu } from 'lucide-react'

export default function Leaderboard({ teams = [] }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score)
  const [hovered, setHovered] = useState(null)

  const rankColor = (i) => ['#ffaa00','#b0b8c8','#cd7f32'][i] || '#6080a0'
  const rankLabel = (i) => ['🥇','🥈','🥉'][i] || `#${i + 1}`

  return (
    <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid #1a2030' }}>
        <Trophy size={15} color="#ffaa00" />
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: '#ffaa00', letterSpacing: '0.22em' }}>LİDERLİK TABLOSU</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .35 }}>{teams.length} takım</span>
      </div>

      {teams.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, opacity: .25 }}>
          veri bekleniyor...
        </div>
      )}

      <div className="stagger">
        {sorted.map((team, i) => {
          const winRate = team.played > 0 ? Math.round((team.wins / team.played) * 100) : 0
          const isTop = i < 3
          const color = rankColor(i)
          const isHovered = hovered === i

          return (
            <div key={team._id || team.teamName}
              className="lb-row"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: `14px 24px`,
                borderBottom: '1px solid #0f1218',
                background: isHovered ? 'rgba(0,212,255,.04)' : i === 0 ? 'rgba(255,170,0,.03)' : 'transparent',
                transition: 'background .2s ease, padding .2s ease',
                cursor: 'default',
              }}>

              {/* Rank */}
              <div style={{ width: 32, textAlign: 'center', fontFamily: isTop ? 'inherit' : 'Rajdhani, sans-serif', fontSize: isTop ? 18 : 14, color, fontWeight: 700, flexShrink: 0 }}>
                {rankLabel(i)}
              </div>

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isTop ? `${color}18` : '#141820',
                  border: `1px solid ${isTop ? color + '33' : '#1e2838'}`,
                  transition: 'all .2s ease',
                }}>
                  <Cpu size={14} color={isTop ? color : '#4a5a6a'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.07em', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.teamName}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: .4 }}>
                    {team.played ?? 0}M · {team.wins ?? 0}G · {team.losses ?? 0}K
                  </div>
                </div>
              </div>

              {/* Win rate bar */}
              <div style={{ width: 88 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: .35 }}>G/O</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#00ff88' }}>{winRate}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: '#1a2030', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${winRate}%`,
                    background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                    boxShadow: '0 0 6px rgba(0,255,136,.3)',
                    transition: 'width .6s cubic-bezier(.22,1,.36,1)',
                  }} />
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 56 }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 22, fontWeight: 700, color, lineHeight: 1, textShadow: i === 0 ? `0 0 16px ${color}66` : 'none' }}>
                  {team.score ?? 0}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: .3 }}>puan</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}