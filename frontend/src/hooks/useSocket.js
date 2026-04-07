import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(token) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const s = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true
    })

    s.on('connect', () => {
      console.log("✅ Soket Bağlandı:", s.id)
      setConnected(true)
    })

    s.on('disconnect', () => setConnected(false))
    
    s.on('connect_error', (err) => {
      console.error("❌ Soket Hatası:", err.message)
    })

    setSocket(s)

    return () => {
      s.disconnect()
      setConnected(false)
    }
  }, [token]) 

  return { socket, connected }
}