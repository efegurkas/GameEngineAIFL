import React, { useRef, useEffect } from 'react'
import { Terminal } from 'lucide-react'

// Oyuncu 1 için gümüş (p1_move), Oyuncu 2 için mavi (p2_move) renkleri eklendi.
const TYPE_COLORS = {
  p1_move: '#e2e8f0', p2_move: '#00d4ff',
  move: '#00d4ff', turn: '#00ff88', win: '#ffaa00',
  draw: '#a0a0c0', connect: '#00ff88', error: '#ff3355', info: '#6080a0',
}

const TYPE_ICON = {
  p1_move: '▶', p2_move: '▶',
  move: '▶', win: '🏆', turn: '◈', connect: '⬡', error: '✕', draw: '◉', info: 'ℹ'
}

export default function MatchLog({ logs = [] }) {
  const scrollRef = useRef(null)

  // Otomatik aşağı kaydırma (Daha pürüzsüz çalışan requestAnimationFrame ile düzeltildi)
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight
      })
    }
  }, [logs])

  return (
    <div style={{ height: '100%', maxHeight: 540, display: 'flex', flexDirection: 'column', background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #1a2030', background: 'rgba(0,0,0,.2)' }}>
        <Terminal size={13} color="#00d4ff" />
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: '#00d4ff', letterSpacing: '0.2em' }}>CANLI LOG</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {['#ff3355','#ffaa00','#00ff88'].map(c => (
            <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 4px ${c}88` }} />
          ))}
        </div>
      </div>

      {/* Scroll area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {logs.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6080a0', opacity: .3 }}>
            — bekleniyor —
          </div>
        )}
        
        {logs.map((log, i) => {
          const safeType = (log.type || '').toLowerCase();

          return (
            <div key={i} className="log-entry" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '3px 4px', borderRadius: 3, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#6080a0', opacity: .45, flexShrink: 0, paddingTop: 1 }}>
                {log.time}
              </span>
              
              <span style={{ 
                fontFamily: 'JetBrains Mono, monospace', 
                fontSize: 11, 
                color: TYPE_COLORS[safeType] || '#e2e8f0', 
                lineHeight: 1.5,
                flex: 1,
                wordBreak: 'break-word'
              }}>
                {TYPE_ICON[safeType] && (
                  <span style={{ opacity: .7, marginRight: 5 }}>{TYPE_ICON[safeType]}</span>
                )}
                {log.message || log.text || log.msg || JSON.stringify(log)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )
}