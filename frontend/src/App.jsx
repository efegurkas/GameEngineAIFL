import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useSocket } from './hooks/useSocket'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Arena from './pages/Arena'
import LeaderboardPage from './pages/LeaderboardPage'
import WatchPage from './pages/WatchPage'
import MatchPopup from './components/MatchPopup'

function PrivateRoute({ children }) {
  const { auth } = useAuth()
  return auth ? children : <Navigate to="/login" replace />
}

function AppInner() {
  const { auth } = useAuth()
  const { socket, connected } = useSocket(auth?.token)

  console.log("Auth: ", auth); 

  return (
    <div className="min-h-screen">
      {auth && <Navbar connected={connected} />}
      
    {auth && (
      <MatchPopup 
        socket={socket} 
        currentTeamName={auth.team?.teamName || auth.team?.name} 
      />
    )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard socket={socket} /></PrivateRoute>} />
        <Route path="/arena"     element={<PrivateRoute><Arena socket={socket} connected={connected} /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />

        {/* Public — login gerektirmez, link paylaşılabilir */}
        <Route path="/watch/:matchId" element={<WatchPage />} />

        <Route path="*" element={<Navigate to={auth ? '/arena' : '/login'} replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  )
}