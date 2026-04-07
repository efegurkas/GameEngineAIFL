import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MatchPopup({ socket, currentTeamName }) {
    const [invite, setInvite] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("useEffect'e giriş yapıldı. Soket durumu:", !!socket);

        if (!socket) return;

        const handleJoin = () => {
            if (currentTeamName) {
                console.log("📡 Odaya katılma isteği atılıyor:", currentTeamName);
                socket.emit('join_team_room', currentTeamName);
            }
        };

        if (socket.connected) handleJoin();
        socket.on('connect', handleJoin);

        socket.on('match_invite', (data) => {
            console.log("🎯 BİLDİRİM GELDİ!", data);
            setInvite(data);
        });

        return () => {
            socket.off('connect', handleJoin);
            socket.off('match_invite');
        };
    }, [socket, currentTeamName]);

    if (!invite) return null; 
    const opponent = invite.team1 === currentTeamName ? invite.team2 : invite.team1;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            background: '#0c0f14',
            border: '1px solid #00d4ff',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minWidth: '280px',
            animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style>
                {`
                @keyframes slideIn {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                `}
            </style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.1em' }}>
                    ⚠️ ARENA ÇAĞRISI
                </span>
                <button 
                    onClick={() => setInvite(null)}
                    style={{ background: 'transparent', border: 'none', color: '#6080a0', cursor: 'pointer', fontSize: '16px' }}
                >
                    ✕
                </button>
            </div>

            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#e2e8f0' }}>
                Rakip eşleşti: <span style={{ color: '#ffaa00' }}>{opponent}</span>
            </div>

            <button 
                onClick={() => {
                    setInvite(null); // Tıklayınca popup'ı kapat
                    navigate(`/watch/${invite.matchId}`); // Maça git
                }}
                style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid #00d4ff',
                    color: '#00d4ff',
                    padding: '8px',
                    borderRadius: '4px',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#00d4ff'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'; e.currentTarget.style.color = '#00d4ff'; }}
            >
                MAÇA GİT ❯
            </button>
        </div>
    );
}