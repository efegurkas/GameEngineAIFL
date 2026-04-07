import React, { useState, useEffect } from 'react'

const SIZE = 15
const CELL = 36         // hücreler arası mesafe (px)
const STONE = 30        // taş çapı (px)
const PAD = CELL / 2   // kenar boşluğu — tam yarım hücre

// Toplam canvas boyutu: her yönde yarım hücre boşluk + (SIZE-1) aralık
const BOARD_PX = PAD * 2 + (SIZE - 1) * CELL   // = 18 + 14*36 + 18 = 540

export default function Board({ board, lastMove, winningStones = [], onCellClick, interactive = false }) {
  const [newStone, setNewStone] = useState(null)

  useEffect(() => {
    if (lastMove) setNewStone(`${lastMove.y}-${lastMove.x}`)
    const t = setTimeout(() => setNewStone(null), 300)
    return () => clearTimeout(t)
  }, [lastMove])

  const displayBoard = board || Array(SIZE).fill(null).map(() => Array(SIZE).fill(0))
  const isWinning = (r, c) => winningStones.some(([wr, wc]) => wr === r && wc === c)
  const isLast    = (r, c) => lastMove && lastMove.y === r && lastMove.x === c

  // Koordinat → piksel: kesişim noktası
  const px = (i) => PAD + i * CELL

  return (
    <div className="relative select-none" style={{ width: BOARD_PX, height: BOARD_PX, flexShrink: 0 }}>
      {/* Ahşap arka plan */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1a1008 0%, #0f0a05 50%, #1a1008 100%)',
          borderRadius: 4,
          boxShadow: '0 0 0 1px #2a1f0a, 0 0 40px rgba(0,0,0,.8), inset 0 0 60px rgba(0,0,0,.4)',
        }}
      />

      {/* SVG: grid çizgileri + yıldız noktaları
          Çizgiler px(0)→px(14) arasında, taşların tam kesişim noktalarında */}
      <svg
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        width={BOARD_PX}
        height={BOARD_PX}
      >
        {Array(SIZE).fill(0).map((_, i) => (
          <g key={i}>
            {/* Dikey */}
            <line x1={px(i)} y1={px(0)} x2={px(i)} y2={px(SIZE - 1)}
              stroke="#3d2a0a" strokeWidth="0.9" />
            {/* Yatay */}
            <line x1={px(0)} y1={px(i)} x2={px(SIZE - 1)} y2={px(i)}
              stroke="#3d2a0a" strokeWidth="0.9" />
          </g>
        ))}
        {/* Yıldız noktaları (hoshi) */}
        {[3, 7, 11].flatMap(r => [3, 7, 11].map(c => (
          <circle key={`s${r}${c}`} cx={px(c)} cy={px(r)} r={3.5} fill="#3d2a0a" />
        )))}
      </svg>

      {/* Taşlar: mutlak konumlandırma, kesişim merkezleri */}
      {displayBoard.map((row, r) =>
        row.map((cell, c) => {
          const key   = `${r}-${c}`
          const cx    = px(c)
          const cy    = px(r)
          const isNew = newStone === key
          const win   = isWinning(r, c)
          const last  = isLast(r, c)

          return (
            <div
              key={key}
              onClick={() => interactive && cell === 0 && onCellClick?.(c, r)}
              style={{
                position: 'absolute',
                left: cx - CELL / 2,
                top:  cy - CELL / 2,
                width: CELL,
                height: CELL,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: interactive && cell === 0 ? 'pointer' : 'default',
              }}
            >
              {/* Hover önizleme */}
              {cell === 0 && interactive && (
                <div
                  className="cell-hover"
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    margin: 4,
                    background: '#00d4ff',
                    opacity: 0,
                    transition: 'opacity .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.18'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                />
              )}

              {/* Taş */}
              {cell !== 0 && (
                <div
                  className={isNew ? 'stone-anim' : ''}
                  style={{
                    width: STONE,
                    height: STONE,
                    borderRadius: '50%',
                    position: 'relative',
                    background: cell === 1
                      ? 'radial-gradient(circle at 35% 32%, #666 0%, #1a1a1a 50%, #080808 100%)'
                      : 'radial-gradient(circle at 35% 32%, #fff 0%, #e0e0e0 50%, #b8b8b8 100%)',
                    boxShadow: win
                      ? `0 0 0 2px #ffaa00, 0 0 12px #ffaa00, ${cell === 1
                          ? '2px 3px 8px rgba(0,0,0,.8)'
                          : '2px 3px 6px rgba(0,0,0,.5)'}`
                      : cell === 1
                        ? '2px 3px 8px rgba(0,0,0,.8), inset 0 1px 2px rgba(255,255,255,.12)'
                        : '2px 3px 6px rgba(0,0,0,.5), inset 0 1px 3px rgba(255,255,255,.9)',
                  }}
                >
                  {/* Son hamle göstergesi */}
                  {last && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: cell === 1 ? 'rgba(0,212,255,.9)' : 'rgba(220,40,40,.85)',
                      }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}