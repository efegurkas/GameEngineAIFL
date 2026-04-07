import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import Board from '../components/Board'
import { Copy, Check, Eye, EyeOff, Zap, Activity, Shield, Play, RefreshCw, Cpu, Key, Upload, FileCode, CheckCircle, AlertCircle, X, ChevronRight } from 'lucide-react'

const emptyBoard = Array(15).fill(null).map(() => Array(15).fill(0))

function StatCard({ icon: Icon, label, value, accent, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <div className="card-hover" style={{
      background: '#0c0f14', border: `1px solid ${visible ? accent + '22' : '#1a2030'}`,
      borderRadius: 8, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(8px)',
      transition: 'opacity .4s ease, transform .4s ease, border-color .4s ease, box-shadow .2s ease',
      boxShadow: `0 0 0 1px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.03)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{
        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: accent + '11', border: `1px solid ${accent}33`,
        boxShadow: `0 0 20px ${accent}11`,
      }}>
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1, letterSpacing: '0.04em' }}
          className="count-up">{value}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, opacity: .4, letterSpacing: '0.15em', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  )
}

// ── Bot Code Upload Card ─────────────────────────────────────────────────────
function BotCodeUpload() {
  const [dragOver, setDragOver]   = useState(false)
  const [file, setFile]           = useState(null)
  const [status, setStatus]       = useState(null) // null | 'uploading' | 'success' | 'error'
  const [message, setMessage]     = useState('')
  const [codeStatus, setCodeStatus] = useState(null) // server meta
  const fileRef = useRef()

  // Fetch current submission status on mount
  useEffect(() => {
    fetch('/api/code/status', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setCodeStatus(d))
      .catch(() => {})
  }, [])

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSet(dropped)
  }

  const handleFileChange = (e) => {
    const picked = e.target.files[0]
    if (picked) validateAndSet(picked)
  }

  const validateAndSet = (f) => {
    if (!f.name.endsWith('.py')) {
      setStatus('error'); setMessage('Sadece .py dosyaları kabul edilir'); setFile(null); return
    }
    if (f.size > 200_000) {
      setStatus('error'); setMessage('Dosya çok büyük (max 200KB)'); setFile(null); return
    }
    setFile(f); setStatus(null); setMessage('')
  }

  const handleSubmit = async () => {
    if (!file) return
    setStatus('uploading'); setMessage('Yükleniyor...')

    const reader = new FileReader()
    reader.onload = async (e) => {
      const code = e.target.result
      try {
        const res = await fetch('/api/code/submit', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        const data = await res.json()
        if (res.ok) {
          setStatus('success')
          setMessage(`Kaydedildi · ${(file.size / 1024).toFixed(1)} KB`)
          setCodeStatus({ hasCode: true, submittedAt: new Date().toISOString(), size: code.length })
          setFile(null)
          if (fileRef.current) fileRef.current.value = ''
        } else {
          setStatus('error')
          setMessage(data.message || 'Yükleme başarısız')
        }
      } catch {
        setStatus('error'); setMessage('Sunucuya bağlanılamadı')
      }
    }
    reader.readAsText(file)
  }

  const clearFile = () => {
    setFile(null); setStatus(null); setMessage('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const accent = '#00d4ff'

  return (
    <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, padding: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, boxShadow: `0 0 8px ${accent}` }} />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: accent, letterSpacing: '0.2em' }}>BOT KODU YÜKLEYİCİ</span>
          <FileCode size={13} color={accent + '66'} style={{ marginLeft: 2 }} />
        </div>

        {/* Current status badge */}
        {codeStatus?.hasCode && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20,
            background: 'rgba(0,255,136,.06)', border: '1px solid rgba(0,255,136,.2)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#00ff88',
            letterSpacing: '0.1em',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff88' }} className="pulse-dot" />
            AKTIF KOD VAR
          </div>
        )}
      </div>

      {/* Current submission info */}
      {codeStatus?.hasCode && (
        <div style={{
          padding: '10px 14px', borderRadius: 6, marginBottom: 14,
          background: '#070a0e', border: '1px solid #1a2030',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CheckCircle size={13} color="#00ff88" style={{ flexShrink: 0 }} />
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6080a0', lineHeight: 1.6 }}>
            <span style={{ color: '#00ff88' }}>{codeStatus.teamName}</span>
            {' · '}
            <span>{(codeStatus.size / 1024).toFixed(1)} KB</span>
            {' · '}
            <span>{new Date(codeStatus.submittedAt).toLocaleString('tr')}</span>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileRef.current.click()}
        style={{
          border: `1px dashed ${dragOver ? accent : file ? 'rgba(0,255,136,.4)' : '#1e2838'}`,
          borderRadius: 6, padding: '20px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, cursor: file ? 'default' : 'pointer', minHeight: 110,
          background: dragOver ? 'rgba(0,212,255,.04)' : file ? 'rgba(0,255,136,.03)' : 'rgba(0,0,0,.2)',
          transition: 'all .2s ease',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Subtle corner brackets when dragging */}
        {dragOver && <>
          {[['top:0;left:0', 'border-width:2px 0 0 2px'], ['bottom:0;right:0', 'border-width:0 2px 2px 0']].map(([pos, bw], i) => (
            <div key={i} style={{
              position: 'absolute', width: 12, height: 12,
              borderColor: accent, borderStyle: 'solid', opacity: .7, borderRadius: 1,
              ...(Object.fromEntries(pos.split(';').map(p => p.split(':')))),
              ...(Object.fromEntries(bw.split(':')[1].split(' ').reduce((acc, v, idx) => {
                const sides = ['Top', 'Right', 'Bottom', 'Left']
                // just style inline, skip this
                return acc
              }, [])))
            }} />
          ))}
        </>}

        {!file ? (
          <>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: dragOver ? 'rgba(0,212,255,.1)' : 'rgba(0,212,255,.05)',
              border: `1px solid ${dragOver ? 'rgba(0,212,255,.3)' : 'rgba(0,212,255,.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s ease',
            }}>
              <Upload size={18} color={dragOver ? accent : accent + '66'} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: dragOver ? accent : '#6080a0', letterSpacing: '0.05em', transition: 'color .2s' }}>
                {dragOver ? 'BIRAK' : '.py dosyasını sürükle veya tıkla'}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, opacity: .3, marginTop: 4 }}>
                max 200 KB
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '0 4px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 6, flexShrink: 0,
              background: 'rgba(0,255,136,.08)', border: '1px solid rgba(0,255,136,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileCode size={16} color="#00ff88" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#6080a0', marginTop: 2 }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6080a0', display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".py" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>

      {/* Status message */}
      {(status || message) && (
        <div className="slide-up" style={{
          display: 'flex', alignItems: 'center', gap: 7,
          marginTop: 10, padding: '8px 12px', borderRadius: 5,
          background: status === 'error' ? 'rgba(255,51,85,.06)' : status === 'success' ? 'rgba(0,255,136,.06)' : 'rgba(0,212,255,.06)',
          border: `1px solid ${status === 'error' ? 'rgba(255,51,85,.2)' : status === 'success' ? 'rgba(0,255,136,.2)' : 'rgba(0,212,255,.2)'}`,
        }}>
          {status === 'error'   && <AlertCircle  size={12} color="#ff3355" />}
          {status === 'success' && <CheckCircle  size={12} color="#00ff88" />}
          {status === 'uploading' && (
            <div style={{ width: 12, height: 12, border: '1.5px solid rgba(0,212,255,.3)', borderTopColor: accent, borderRadius: '50%', animation: 'spinFull .7s linear infinite', flexShrink: 0 }} />
          )}
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: status === 'error' ? '#ff3355' : status === 'success' ? '#00ff88' : accent,
          }}>{message}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!file || status === 'uploading'}
        style={{
          width: '100%', marginTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '10px 16px', borderRadius: 5, cursor: file && status !== 'uploading' ? 'pointer' : 'not-allowed',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.12em',
          background: file && status !== 'uploading' ? 'rgba(0,212,255,.08)' : 'rgba(0,212,255,.03)',
          border: `1px solid ${file && status !== 'uploading' ? 'rgba(0,212,255,.3)' : 'rgba(0,212,255,.1)'}`,
          color: file && status !== 'uploading' ? accent : accent + '44',
          transition: 'all .2s ease',
        }}
        onMouseEnter={e => { if (file && status !== 'uploading') { e.currentTarget.style.background = 'rgba(0,212,255,.14)'; e.currentTarget.style.boxShadow = `0 0 16px rgba(0,212,255,.1)` } }}
        onMouseLeave={e => { e.currentTarget.style.background = file && status !== 'uploading' ? 'rgba(0,212,255,.08)' : 'rgba(0,212,255,.03)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        {status === 'uploading' ? (
          <div style={{ width: 12, height: 12, border: '1.5px solid rgba(0,212,255,.3)', borderTopColor: accent, borderRadius: '50%', animation: 'spinFull .7s linear infinite' }} />
        ) : (
          <ChevronRight size={13} />
        )}
        {status === 'uploading' ? 'YÜKLENİYOR...' : 'KODU GÖNDER'}
      </button>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ socket }) {
  const { auth } = useAuth()
  // auth.team → login'den dönen team objesi; yoksa auth'un kendisi eski yapı
  const team = auth?.team ?? auth

  const [showKey, setShowKey]   = useState(false)
  const [copied, setCopied]     = useState(false)
  const [stats, setStats]       = useState({
    score:  team?.score  ?? 0,
    played: team?.played ?? 0,
    wins:   team?.wins   ?? 0,
    losses: team?.losses ?? 0,
  })
  const [testGame, setTestGame] = useState({ board: emptyBoard, turn: 1, isGameOver: false, winner: null, gameId: null })
  const [testLog, setTestLog]   = useState([])
  const [lastMove, setLastMove] = useState(null)

  useEffect(() => {
    fetch('/api/teams/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setStats({
        score:   d.score   ?? 0,
        played:  d.played  ?? 0,
        wins:    d.wins    ?? 0,
        losses:  d.losses  ?? 0,
      }))
      .catch(() => {
        // /api/teams/me başarısız olursa auth'tan gelen anlık veriyi kullan
        if (team) setStats({
          score:   team.score   ?? 0,
          played:  team.played  ?? 0,
          wins:    team.wins    ?? 0,
          losses:  team.losses  ?? 0,
        })
      })
  }, [auth])

  useEffect(() => {
    if (!socket) return
    const handler = (data) => {
      if (data.gameId !== testGame.gameId) return
      setTestGame(prev => ({ ...prev, ...data }))
      if (data.lastMove) {
        setLastMove(data.lastMove)
        const col = String.fromCharCode(65 + data.lastMove.x)
        addLog(`${data.lastMove.player === 1 ? 'Siyah' : 'Beyaz'}: ${col}${15 - data.lastMove.y}`, 'move')
      }
      if (data.isGameOver)
        addLog(data.winner === 'DRAW' ? 'Beraberlik!' : `Kazanan: ${data.winner === 1 ? 'Siyah' : 'Beyaz'}`, 'win')
    }
    socket.on('game_update', handler)
    return () => socket.off('game_update', handler)
  }, [socket, testGame.gameId])

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString('tr', { hour12: false })
    setTestLog(prev => [...prev.slice(-49), { message, type, time }])
  }

  const startTestGame = async () => {
    try {
      const res  = await fetch('/api/new', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: 15 }) })
      const data = await res.json()
      setTestGame({ board: emptyBoard, turn: 1, isGameOver: false, winner: null, gameId: data.gameId })
      setTestLog([]); setLastMove(null)
      addLog('Test oyunu başlatıldı', 'connect')
    } catch { addLog('Sunucuya bağlanılamadı', 'error') }
  }

  const handleBoardClick = async (x, y) => {
    if (!testGame.gameId || testGame.isGameOver) return
    const prev = testGame.turn
    try {
      const res  = await fetch(`/api/move/${testGame.gameId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ x, y }) })
      const data = await res.json()
      setTestGame(g => ({ ...g, ...data })); setLastMove({ x, y })
      const col = String.fromCharCode(65 + x)
      addLog(`${prev === 1 ? 'Siyah' : 'Beyaz'}: ${col}${15 - y}`, 'move')
      if (data.isGameOver) addLog(data.winner === 'DRAW' ? 'Beraberlik!' : `Kazanan: ${data.winner === 1 ? 'Siyah' : 'Beyaz'}`, 'win')
    } catch { addLog('Hamle gönderilemedi', 'error') }
  }

  const copyKey = () => {
    navigator.clipboard.writeText(team?.botApiKey || '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const logColor = { move: '#00d4ff', win: '#ffaa00', connect: '#00ff88', error: '#ff3355', info: '#6080a0' }

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 3, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #00d4ff, rgba(0,212,255,.2))', boxShadow: '0 0 10px #00d4ff' }} />
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 26, fontWeight: 700, letterSpacing: '0.18em', color: '#e2e8f0' }}>TAKIM PANELİ</h1>
        </div>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .3, marginLeft: 13 }}>
          Hoş geldin, <span style={{ color: '#00d4ff', opacity: 1 }}>{team?.teamName}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Zap}      label="TOPLAM PUAN"  value={stats.score}   accent="#ffaa00" delay={0}   />
        <StatCard icon={Activity} label="OYNANAN MAÇ"  value={stats.played}  accent="#00d4ff" delay={60}  />
        <StatCard icon={Shield}   label="GALİBİYET"    value={stats.wins}    accent="#00ff88" delay={120} />
        <StatCard icon={Cpu}      label="MAĞLUBIYET"   value={stats.losses}  accent="#ff3355" delay={180} />
      </div>

      {/* Row 1: API Key + Test Arena */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* API Key card */}
        <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 3, height: 18, borderRadius: 2, background: '#ffaa00', boxShadow: '0 0 8px #ffaa00' }} />
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: '#ffaa00', letterSpacing: '0.2em' }}>BOT API ANAHTARI</span>
            <Key size={13} color="#ffaa0066" style={{ marginLeft: 2 }} />
          </div>

          <div style={{
            padding: '14px 16px', borderRadius: 6, marginBottom: 12,
            background: '#070a0e', border: '1px solid #1a2030',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#00d4ff', letterSpacing: '0.04em', wordBreak: 'break-all',
            minHeight: 48, display: 'flex', alignItems: 'center',
            transition: 'border-color .2s',
          }}>
            {showKey ? (team?.botApiKey || 'anahtar bulunamadı') : '•'.repeat(36)}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { label: showKey ? 'GİZLE' : 'GÖSTER', Icon: showKey ? EyeOff : Eye, action: () => setShowKey(!showKey), color: '#6080a0' },
              { label: copied ? 'KOPYALANDI' : 'KOPYALA', Icon: copied ? Check : Copy, action: copyKey, color: copied ? '#00ff88' : '#6080a0' },
            ].map(({ label, Icon, action, color }) => (
              <button key={label} onClick={action} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.12em',
                background: color === '#00ff88' ? 'rgba(0,255,136,.08)' : '#141820',
                border: `1px solid ${color === '#00ff88' ? 'rgba(0,255,136,.25)' : '#1e2838'}`,
                borderRadius: 5, color, cursor: 'pointer', transition: 'all .2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1a2030'; e.currentTarget.style.borderColor = '#2a3848' }}
                onMouseLeave={e => { e.currentTarget.style.background = color === '#00ff88' ? 'rgba(0,255,136,.08)' : '#141820'; e.currentTarget.style.borderColor = color === '#00ff88' ? 'rgba(0,255,136,.25)' : '#1e2838' }}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #1a2030', paddingTop: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6080a0', lineHeight: 1.8, opacity: .6 }}>
            Botunuzu bu anahtarla bağlayın:<br />
            <span style={{ color: 'rgba(0,212,255,.5)' }}>{'socket.auth = { apiKey: "..." }'}</span>
          </div>
        </div>

        {/* Test Arena */}
        <div style={{ background: '#0c0f14', border: '1px solid #1a2030', borderRadius: 8, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 18, borderRadius: 2, background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: '#00ff88', letterSpacing: '0.2em' }}>TEST ARENASI</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {testGame.gameId && (
                <button onClick={startTestGame} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  background: '#141820', border: '1px solid #1e2838', borderRadius: 4, color: '#6080a0', cursor: 'pointer',
                }}>
                  <RefreshCw size={10} /> SIFIRLA
                </button>
              )}
              <button onClick={startTestGame} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                background: 'rgba(0,255,136,.08)', border: '1px solid rgba(0,255,136,.22)', borderRadius: 4, color: '#00ff88', cursor: 'pointer',
                transition: 'all .2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,136,.08)' }}>
                <Play size={10} /> {testGame.gameId ? 'YENİ OYUN' : 'BAŞLAT'}
              </button>
            </div>
          </div>

          {!testGame.gameId ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,255,136,.06)', border: '1px solid rgba(0,255,136,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={20} color="rgba(0,255,136,.4)" />
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, opacity: .25 }}>
                BAŞLAT butonuna tıklayın
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flexShrink: 0, transform: 'scale(0.60)', transformOrigin: 'top left', marginBottom: -216 }}>
                <Board board={testGame.board} lastMove={lastMove} onCellClick={handleBoardClick} interactive={!testGame.isGameOver} />
              </div>
              <div style={{ flex: 1, minWidth: 0, maxHeight: 326, overflowY: 'auto' }}>
                {testGame.isGameOver && (
                  <div className="slide-up" style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 5, background: 'rgba(255,170,0,.08)', border: '1px solid rgba(255,170,0,.2)', fontFamily: 'Rajdhani, sans-serif', fontSize: 14, color: '#ffaa00', textAlign: 'center' }}>
                    {testGame.winner === 'DRAW' ? '🤝 Beraberlik' : `🏆 ${testGame.winner === 1 ? 'Siyah' : 'Beyaz'} Kazandı`}
                  </div>
                )}
                {testLog.slice(-16).map((l, i) => (
                  <div key={i} className="log-entry" style={{ display: 'flex', gap: 8, padding: '3px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
                    <span style={{ color: '#6080a0', opacity: .5, flexShrink: 0 }}>{l.time}</span>
                    <span style={{ color: logColor[l.type] || '#e2e8f0' }}>{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Bot Code Upload (full width) */}
      <BotCodeUpload />

    </div>
  )
}