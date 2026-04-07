import React, { useState, useEffect, useRef } from 'react'
import Board from '../components/Board'
import MatchLog from '../components/MatchLog'
import { Clock, Wifi, WifiOff } from 'lucide-react'

const emptyBoard = Array(15).fill(null).map(() => Array(15).fill(0))

function PlayerCard({ player, name, timeLeft, isActive, score }) {
  const stone1 = 'radial-gradient(circle at 35% 32%, #666 0%, #1a1a1a 50%, #080808 100%)'
  const stone2 = 'radial-gradient(circle at 35% 32%, #fff 0%, #e0e0e0 50%, #b8b8b8 100%)'
  const timerColor = timeLeft < 10 ? '#ff3355' : timeLeft < 20 ? '#ffaa00' : '#00d4ff'
  const pct = Math.max(0, Math.min(100, (timeLeft / 30) * 100))

  return (
    <div style={{
      background: '#0c0f14', borderRadius: 8, padding: 20, position: 'relative', overflow: 'hidden',
      border: `1px solid ${isActive ? (player === 1 ? 'rgba(226,232,240,.2)' : 'rgba(0,212,255,.25)') : '#1a2030'}`,
      boxShadow: isActive ? `0 0 24px ${player === 1 ? 'rgba(226,232,240,.05)' : 'rgba(0,212,255,.07)'}` : 'none',
      transition: 'border-color .4s ease, box-shadow .4s ease',
      animation: isActive ? 'activeBorder 2.5s ease-in-out infinite' : 'none',
    }}>
      {/* Active strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: isActive ? (player === 1 ? 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' : 'linear-gradient(90deg, transparent, #00d4ff, transparent)') : 'transparent',
        boxShadow: isActive ? `0 0 12px ${player === 1 ? '#e2e8f0' : '#00d4ff'}` : 'none',
        transition: 'all .4s ease',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: isActive ? 16 : 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: player === 1 ? stone1 : stone2,
          boxShadow: player === 1 ? '2px 3px 10px rgba(0,0,0,.8), inset 0 1px 2px rgba(255,255,255,.12)' : '2px 3px 8px rgba(0,0,0,.5), inset 0 1px 3px rgba(255,255,255,.9)',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 15, fontWeight: 600, letterSpacing: '0.08em', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name || (player === 1 ? 'Siyah' : 'Beyaz')}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .35, letterSpacing: '0.1em' }}>
            {player === 1 ? 'SİYAH' : 'BEYAZ'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, color: '#ffaa00', lineHeight: 1, textShadow: '0 0 12px rgba(255,170,0,.4)' }}>{score}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: .3 }}>PUAN</div>
        </div>
      </div>

      {/* Timer bar */}
      {isActive && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: .4 }}>
              <Clock size={9} /> SÜRE
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 500, color: timerColor, textShadow: `0 0 10px ${timerColor}88`, transition: 'color .3s' }}>
              {timeLeft}s
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: '#1a2030', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${timerColor}, ${timerColor}aa)`,
              boxShadow: `0 0 6px ${timerColor}66`,
              transition: 'width 1s linear, background .3s',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Arena({ socket, connected }) {
  const [matchState, setMatchState] = useState({
    board: emptyBoard, turn: 1, isGameOver: false, winner: null,
    teams: { 1: { name: 'Bot Alpha', score: 0 }, 2: { name: 'Bot Beta', score: 0 } },
    matchId: null, moveCount: 0,
  })
  const [lastMove, setLastMove] = useState(null)
  const [logs, setLogs] = useState([
    { message: 'Arena hazır — maç bekleniyor', type: 'info', time: new Date().toLocaleTimeString('tr', { hour12: false }) }
  ])
  const [timers, setTimers] = useState({ 1: 30, 2: 30 })
  const timerRef = useRef(null)
  const teamsRef = useRef(matchState.teams)

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('tr', { hour12: false })
    setLogs(prev => [...prev.slice(-99), { message, type, time }])
  }

  useEffect(() => { teamsRef.current = matchState.teams }, [matchState.teams])

  useEffect(() => {
    if (!socket) return
    socket.on('match_start', (data) => {
      const teams = { 1: { name: data.team1, score: 0 }, 2: { name: data.team2, score: 0 } }
      setMatchState(prev => ({ ...prev, board: emptyBoard, turn: 1, isGameOver: false, winner: null, matchId: data.matchId, teams, moveCount: 0 }))
      setLastMove(null); setTimers({ 1: 30, 2: 30 })
      addLog(`Maç başladı: ${data.team1} ⚔ ${data.team2}`, 'connect')
    })
    
    socket.on('game_update', (data) => {
      setMatchState(prev => {
        const nextBoard = data.board || prev.board;
        // Hamle sayısını direkt tahtadaki dolu taşları sayarak kesin bir şekilde hesaplıyoruz
        const exactMoveCount = nextBoard.flat().filter(c => c !== 0).length;

        return {
          ...prev,
          board: nextBoard,
          // Eğer data içinde bu özellikler yoksa eskisini koru (Undefined olmasını engeller)
          turn: data.turn !== undefined ? data.turn : prev.turn,
          isGameOver: data.isGameOver !== undefined ? data.isGameOver : prev.isGameOver,
          winner: data.winner !== undefined ? data.winner : prev.winner,
          moveCount: exactMoveCount
        }
      })

      if (data.lastMove) {
        const { x, y, player } = data.lastMove
        setLastMove({ x, y }); 
        setTimers(t => ({ ...t, [player]: 30 }))
        const col = String.fromCharCode(65 + x)
        
        addLog(`${teamsRef.current[player]?.name} → ${col}${15 - y}`, player === 1 ? 'p1_move' : 'p2_move')
      }
      
      if (data.isGameOver) {
        if (data.winner === 'DRAW') addLog('Beraberlik! Tahta doldu.', 'draw')
        else addLog(`${teamsRef.current[data.winner]?.name} KAZANDI! 🏆`, 'win')
      }
    })
    
    socket.on('player_timeout', (data) => addLog(`${data.teamName} — süre aşımı`, 'error'))
    socket.on('match_end', (data) => addLog(`Maç bitti: ${data.result}`, 'win'))
    
    return () => { socket.off('match_start'); socket.off('game_update'); socket.off('player_timeout'); socket.off('match_end') }
  }, [socket])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (matchState.isGameOver) return
    timerRef.current = setInterval(() => {
      setTimers(t => ({ ...t, [matchState.turn]: Math.max(0, (t[matchState.turn] || 30) - 1) }))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [matchState.turn, matchState.isGameOver])

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #00d4ff, rgba(0,212,255,.2))', boxShadow: '0 0 10px #00d4ff' }} />
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '0.18em' }}>CANLI ARENA</h1>
          {matchState.matchId && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '3px 8px', border: '1px solid #1a2030', borderRadius: 4, opacity: .35 }}>
              #{matchState.matchId.slice(-6)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {matchState.moveCount > 0 && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .3 }}>{matchState.moveCount} hamle</span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: connected ? 'rgba(0,255,136,.06)' : 'rgba(255,51,85,.06)', border: `1px solid ${connected ? 'rgba(0,255,136,.2)' : 'rgba(255,51,85,.2)'}` }}>
            {connected ? <Wifi size={11} color="#00ff88" /> : <WifiOff size={11} color="#ff3355" />}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: connected ? '#00ff88' : '#ff3355' }}>
              {connected ? 'CANLI' : 'KESİK'}
            </span>
          </div>
        </div>
      </div>

      {/* Ortalanmış Grid Düzeni */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 240px', gap: 20, alignItems: 'center' }}>

        {/* Player 1 + Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PlayerCard player={1} name={matchState.teams[1]?.name} timeLeft={timers[1]} isActive={matchState.turn === 1 && !matchState.isGameOver} score={matchState.teams[1]?.score || 0} />
          <div style={{ height: 460 }}>
            <MatchLog logs={logs} />
          </div>
        </div>

        {/* Board center */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          
          <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {matchState.isGameOver && matchState.winner && (
              <div className="win-banner" style={{
                padding: '12px 28px', borderRadius: 8, textAlign: 'center',
                background: 'rgba(255,170,0,.07)', border: '1px solid rgba(255,170,0,.3)',
                boxShadow: '0 0 30px rgba(255,170,0,.08)',
              }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 20, color: '#ffaa00', letterSpacing: '0.2em', textShadow: '0 0 20px rgba(255,170,0,.5)' }}>
                  {matchState.winner === 'DRAW' ? '🤝 BERABERLİK' : `🏆 ${matchState.winner === 1 ? matchState.teams[1]?.name : matchState.teams[2]?.name} KAZANDI`}
                </div>
              </div>
            )}
          </div>

          <Board board={matchState.board} lastMove={lastMove} interactive={false} />

          <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {!matchState.isGameOver && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .4 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: matchState.turn === 1 ? 'radial-gradient(circle at 35% 32%, #666, #0a0a0a)' : 'radial-gradient(circle at 35% 32%, #fff, #b8b8b8)',
                  boxShadow: '0 0 6px rgba(0,212,255,.3)',
                }} />
                <span>{matchState.turn === 1 ? matchState.teams[1]?.name : matchState.teams[2]?.name} oynuyor</span>
              </div>
            )}
          </div>

        </div>

        {/* Player 2 + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PlayerCard player={2} name={matchState.teams[2]?.name} timeLeft={timers[2]} isActive={matchState.turn === 2 && !matchState.isGameOver} score={matchState.teams[2]?.score || 0} />

          <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, padding: 20 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .3, letterSpacing: '0.15em', marginBottom: 14 }}>MAÇ İSTATİSTİKLERİ</div>
            {[
              ['Toplam Hamle', matchState.moveCount || 0],
              ['Sıra', matchState.turn === 1 ? matchState.teams[1]?.name : matchState.teams[2]?.name],
              ['Durum', matchState.isGameOver ? 'BİTTİ' : 'DEVAM EDİYOR'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a2030' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .4 }}>{label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#00d4ff' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}