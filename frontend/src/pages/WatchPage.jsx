  import React, { useState, useEffect, useRef } from 'react'
  import { useParams, useNavigate } from 'react-router-dom'
  import { io } from 'socket.io-client'
  import Board from '../components/Board'
  import MatchLog from '../components/MatchLog'
  import { Eye, Wifi, WifiOff, ArrowLeft, Users } from 'lucide-react'

  const emptyBoard = Array(15).fill(null).map(() => Array(15).fill(0))

  export default function WatchPage() {
    const { matchId } = useParams()
    const navigate = useNavigate()
    const socketRef = useRef(null)
    const playersRef = useRef({ 1: 'Oyuncu 1', 2: 'Oyuncu 2' })

    const [connected, setConnected] = useState(false)
    const [error, setError]         = useState('')
    const [board, setBoard]         = useState(emptyBoard)
    const [turn, setTurn]           = useState(1)
    const [isGameOver, setIsGameOver] = useState(false)
    const [winner, setWinner]       = useState(null)
    const [lastMove, setLastMove]   = useState(null)
    const [logs, setLogs]           = useState([])
    const [moveCount, setMoveCount] = useState(0)
    const [players, setPlayers]     = useState({ 1: 'Oyuncu 1', 2: 'Oyuncu 2' })
    const [viewerCount, setViewerCount] = useState(1)

    const addLog = (message, type = 'info') => {
      const time = new Date().toLocaleTimeString('tr', { hour12: false })
      setLogs(prev => [...prev.slice(-199), { message, type, time }])
    }

    useEffect(() => { playersRef.current = players }, [players])

    useEffect(() => {
      const socket = io('/', { transports: ['websocket'] })
      socketRef.current = socket

      socket.on('connect', () => {
        setConnected(true)
        setError('')
        addLog('Sunucuya bağlanıldı', 'connect')
        socket.emit('watch_match', matchId)
        addLog(`Maç izleniyor: …${matchId.slice(-8)}`, 'info')
      })

      socket.on('disconnect', () => {
        setConnected(false)
        addLog('Bağlantı kesildi', 'error')
      })

      socket.on('error', (msg) => {
        const text = typeof msg === 'string' ? msg : 'Maç bulunamadı veya sona erdi'
        setError(text)
        addLog(text, 'error')
      })

      socket.on('match_start', (data) => {
        const p = { 1: data.team1 || 'Oyuncu 1', 2: data.team2 || 'Oyuncu 2' }
        setPlayers(p)
        playersRef.current = p
        addLog(`${data.team1} ⚔ ${data.team2}`, 'connect')
      })

      socket.on('game_update', (data) => {
        if (data.board) {
          setBoard(data.board)
          setMoveCount(data.board.flat().filter(c => c !== 0).length)
        }
        
        if (data.turn !== undefined) setTurn(data.turn)
        if (data.isGameOver !== undefined) setIsGameOver(data.isGameOver)
        if (data.winner !== undefined)     setWinner(data.winner)

        if (data.lastMove) {
          const { x, y, player } = data.lastMove
          setLastMove({ x, y })
          
          if (!data.board) setMoveCount(c => c + 1)
          
          const col = String.fromCharCode(65 + x)
          const who = playersRef.current[player] || `Oyuncu ${player}`
          addLog(`${who} → ${col}${15 - y}`, player === 1 ? 'p1_move' : 'p2_move')
        } 
        else if (data.board) {
          const filled = data.board.flat().filter(c => c !== 0).length
          if (filled > 0) {
            addLog(`Devam eden maça katıldı (${filled} hamle)`, 'info')
          }
        }

        if (data.isGameOver) {
          if (data.winner === 'DRAW') {
            addLog('Beraberlik! Tahta doldu.', 'draw')
          } else {
            const winName = playersRef.current[data.winner] || `Oyuncu ${data.winner}`
            addLog(`${winName} KAZANDI! 🏆`, 'win')
          }
        }
      })

      socket.on('viewer_count', (count) => setViewerCount(count))

      return () => socket.disconnect()
    }, [matchId])

    const Stone = ({ player, size = 20 }) => (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: player === 1
          ? 'radial-gradient(circle at 35% 32%, #666, #0a0a0a)'
          : 'radial-gradient(circle at 35% 32%, #fff, #b8b8b8)',
        boxShadow: player === 1 ? '1px 2px 4px rgba(0,0,0,.8)' : '1px 2px 4px rgba(0,0,0,.5)',
      }} />
    )

    return (
      // 1. Ana çerçeve (Ekrana sabit, taşma kapalı)
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#050709', overflow: 'hidden' }}>

        {/* 2. SABİT NAVBAR (Asla küçülmez ve yukarı çıkmaz) */}
        <div style={{
          height: 56, flexShrink: 0, width: '100%',
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
          borderBottom: '1px solid #1a2030',
          background: '#050709', zIndex: 10
        }}>
          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: '#6080a0', background: 'none', border: 'none', cursor: 'pointer',
            opacity: .5,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = .5}
          >
            <ArrowLeft size={13} /> GERİ
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto' }}>
            <Eye size={14} color="#00d4ff" />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, color: '#00d4ff', letterSpacing: '0.2em' }}>
              CANLI İZLEME
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
              padding: '2px 8px', border: '1px solid #1a2030', borderRadius: 3, opacity: .4,
            }}>
              #{matchId?.slice(-8)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .4 }}>
              <Users size={11} /> {viewerCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
              {connected
                ? <><Wifi size={11} color="#00ff88" /><span style={{ color: '#00ff88' }}>CANLI</span></>
                : <><WifiOff size={11} color="#ff3355" /><span style={{ color: '#ff3355' }}>KESİK</span></>
              }
            </div>
          </div>
        </div>

        {/* 3. İÇERİK ALANI (Scroll sadece burada çalışır) */}
        <div style={{ flex: 1, overflowY: 'auto', width: '100%', position: 'relative' }}>
          
          {error ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: '100%' }}>
              <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 4, padding: 40, textAlign: 'center', maxWidth: 380 }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 20, color: '#ff3355', marginBottom: 8 }}>Maç Bulunamadı</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6080a0', marginBottom: 24 }}>{error}</div>
                <button onClick={() => navigate('/')} style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                  padding: '8px 20px', background: '#1a2030', border: '1px solid #2a3040',
                  borderRadius: 3, color: '#a0b0c0', cursor: 'pointer',
                }}>Ana Sayfaya Dön</button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 60px 20px' }}>
              
              {/* Player vs Player (Top Banner) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
                {[1, 2].map((p, idx) => (
                  <React.Fragment key={p}>
                    {idx === 1 && (
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 16, opacity: .25, letterSpacing: '0.2em' }}>VS</span>
                    )}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 18px',
                      background: '#0c0f14',
                      border: `1px solid ${turn === p && !isGameOver ? (p === 1 ? 'rgba(226,232,240,.25)' : 'rgba(0,212,255,.25)') : '#1a2030'}`,
                      borderRadius: 4,
                      boxShadow: turn === p && !isGameOver ? `0 0 16px ${p === 1 ? 'rgba(226,232,240,.08)' : 'rgba(0,212,255,.08)'}` : 'none',
                    }}>
                      <Stone player={p} size={18} />
                      <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, letterSpacing: '0.08em' }}>
                        {players[p]}
                      </span>
                      
                      {turn === p && !isGameOver && (
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: p === 1 ? '#e2e8f0' : '#00d4ff', 
                          boxShadow: `0 0 8px ${p === 1 ? '#e2e8f0' : '#00d4ff'}`,
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* ── Tahta (Sol) + İstatistik & Log (Sağ) Düzeni ── */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Sol: Tahta Sütunu */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  
                  {/* Kazanan Banner için sabit alan */}
                  <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {isGameOver && (
                      <div style={{
                        padding: '12px 28px', background: 'rgba(255,170,0,.06)', 
                        border: '1px solid rgba(255,170,0,.3)', borderRadius: 8, textAlign: 'center',
                        boxShadow: '0 0 30px rgba(255,170,0,.08)'
                      }}>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 20, color: '#ffaa00', letterSpacing: '0.2em' }}>
                          {winner === 'DRAW' ? '🤝 BERABERLİK' : `🏆 ${winner === 1 ? players[1] : players[2]} KAZANDI`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tahta */}
                  <Board board={board} lastMove={lastMove} interactive={false} />

                  {/* Oynayan Kişi Belirteci Alanı (Sabit Boy) */}
                  <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {!isGameOver && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .4 }}>
                        <Stone player={turn} size={12} />
                        <span>{players[turn]} oynuyor</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sağ: İstatistik ve Log Sütunu */}
                <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16, marginTop: 66 }}>
                  
                  {/* İstatistik Paneli */}
                  <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, padding: 20 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .3, letterSpacing: '0.15em', marginBottom: 14 }}>MAÇ İSTATİSTİKLERİ</div>
                    {[
                      ['Toplam Hamle', moveCount || 0],
                      ['Sıra', isGameOver ? '-' : players[turn]],
                      ['Durum', isGameOver ? 'BİTTİ' : 'DEVAM EDİYOR'],
                    ].map(([label, value], i) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: i === 2 ? '10px 0 0 0' : '10px 0', borderBottom: i === 2 ? 'none' : '1px solid #1a2030' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .4 }}>{label}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#00d4ff', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Log Paneli (Yükseklik tahtaya göre sabitlendi) */}
                  <div style={{ height: 410, display: 'flex', flexDirection: 'column' }}>
                    <MatchLog logs={logs} />
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    )
  }