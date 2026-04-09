const Team         = require('../models/Team');
const GomokuEngine = require('../engine/gomokuEngine');

const activeBots   = new Map();
const activeMatches = new Map();   
const waitingQueue  = [];

module.exports = (io) => {

  try {
    const matchRoute = require('../routes/match');
    matchRoute.init(io, activeMatches);
  } catch (e) {
    console.warn('[socket] match route inject edilemedi:', e.message);
  }

  io.on('connection', (socket) => {
    console.log(`[socket] Bağlantı: ${socket.id}`);

    socket.on('join_team_room', (teamName) => {
      if (teamName){
        socket.join(teamName); 
        console.log(`[socket] Web arayüzü bildirim odasına katıldı: ${teamName}`); 
      }
    });

    // ── CANLI BOT KAYDI ──────────────────────────────────────────────────
    socket.on('register_bot', async (data) => {
      try {
        const { botApiKey } = data;
        const team = await Team.findOne({ botApiKey });

        if (!team) {
          socket.emit('error', 'Geçersiz api key!');
          return socket.disconnect();
        }

        activeBots.set(socket.id, { teamName: team.teamName, id: team._id });
        socket.emit('registered', { message: `Hoş geldin ${team.teamName}` });
        console.log(`[socket] Bot doğrulandı: ${team.teamName}`);
      } catch (err) {
        console.error('[socket] auth hatası:', err);
      }
    });

    // ── MAÇ BULMA (canlı bot vs bot) ─────────────────────────────────────
    socket.on('find_match', () => {
      const bot = activeBots.get(socket.id);
      if (!bot) return socket.emit('error', 'Önce kayıt olmalısın');

      if (!waitingQueue.includes(socket.id)) {
        waitingQueue.push(socket.id);
        console.log(`[socket] ${bot.teamName} kuyruğa girdi. Kuyruk: ${waitingQueue.length}`);
      }

      if (waitingQueue.length >= 2) {
        const p1Id = waitingQueue.shift();
        const p2Id = waitingQueue.shift();

        const p1 = activeBots.get(p1Id);
        const p2 = activeBots.get(p2Id);

        const game    = new GomokuEngine(15);
        const matchId = `match_${Date.now()}`;

        activeMatches.set(matchId, {
          engine: game,
          players: {
            1: { id: p1Id, name: p1.teamName },
            2: { id: p2Id, name: p2.teamName },
          },
          startedAt: Date.now(),
          type: 'live',
        });

        const s1 = io.sockets.sockets.get(p1Id);
        const s2 = io.sockets.sockets.get(p2Id);
        if (s1) s1.join(matchId);
        if (s2) s2.join(matchId);

        io.to(p1Id).emit('match_found', { matchId, role: 1, ...game.getState() });
        io.to(p2Id).emit('match_found', { matchId, role: 2, ...game.getState() });

        // match_start izleyiciler için
        io.to(matchId).emit('match_start', {
          matchId,
          team1: p1.teamName,
          team2: p2.teamName,
        });

        io.to(p1.teamName).to(p2.teamName).emit('match_invite',{
          matchId : matchId,
          team1 : p1.teamName,
          team2 : p2.teamName,
          message: 'Canlı Arena Eşleşmesi!'
        }); 

        console.log(`[socket] Maç: ${matchId} — izle: /watch/${matchId}`);
      }
    });

    // ── CANLI HAMLE ──────────────────────────────────────────────────────
    socket.on('make_move', (data) => {
      const { matchId, x, y } = data;
      const match = activeMatches.get(matchId);
      if (!match) return;

      // Simüle edilen maçlara canlı bot müdahale edemez
      if (match.type === 'simulation') {
        return socket.emit('error', 'Bu maç simüle ediliyor');
      }

      const game   = match.engine;
      const expPlr = game.currentPlayer;

      if (match.players[expPlr].id !== socket.id) {
        return socket.emit('error', 'Sıra sende değil');
      }

      const state = game.playTurn(x, y);
      io.to(matchId).emit('game_update', {
        ...state,
        matchId,
        lastMove: { x, y, player: expPlr },
      });

      if (state.isGameOver) {
        console.log(`[socket] ${matchId} bitti — kazanan: ${state.winner}`);
        io.to(matchId).emit('match_end', {
          matchId,
          winner: state.winner === 1 ? match.players[1].name : state.winner === 2 ? match.players[2].name : 'DRAW',
          winnerRole: state.winner,
          reason: 'normal',
        });
        setTimeout(() => activeMatches.delete(matchId), 120_000);
      }
    });

    // ── İZLEME ───────────────────────────────────────────────────────────
    socket.on('watch_match', (matchId) => {
      const match = activeMatches.get(matchId);
      if (match) {
        socket.join(matchId);
        console.log(`[socket] İzleyici → ${matchId}`);

        // Mevcut durumu gönder
        const state = match.engine.getState();
        socket.emit('game_update', { ...state, matchId, lastMove: null });

        // Eğer maç zaten bitmişse match_end de gönder
        if (state.isGameOver) {
          const w = state.winner;
          socket.emit('match_end', {
            matchId,
            winner: w === 1 ? match.players[1]?.name : w === 2 ? match.players[2]?.name : 'DRAW',
            winnerRole: w,
            reason: 'tamamlandı',
          });
        }
      } else {
        socket.emit('error', 'Maç bulunamadı veya bitti');
      }
    });

    // ── BAĞLANTI KESİLDİ ─────────────────────────────────────────────────
    socket.on('disconnect', () => {
      activeBots.delete(socket.id);
      const idx = waitingQueue.indexOf(socket.id);
      if (idx > -1) waitingQueue.splice(idx, 1);   // ← 'index' değil 'idx' (orijinal bug düzeltildi)
      console.log(`[socket] Ayrıldı: ${socket.id}`);
    });
  });

  // activeMatches'i dışa aç (matchSimulator kullanır)
  return { activeMatches };
};