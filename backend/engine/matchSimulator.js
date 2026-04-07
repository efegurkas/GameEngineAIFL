/**
 * matchSimulator
 * --------------
 * İki takımın Python botlarını başlatır, sırayla hamle ister,
 * Engine üzerinde uygular, Socket.io üzerinden broadcast eder.
 *
 * io.to(matchId).emit('game_update', { board, turn, isGameOver, winner, lastMove, matchId })
 * io.to(matchId).emit('match_start',  { matchId, team1, team2 })
 * io.to(matchId).emit('match_end',    { matchId, winner, reason, moves })
 */

const GomokuEngine = require('./gomokuEngine');
const BotRunner    = require('./botRunner');

// Hamleler arası bekleme (ms) — izleme için görsel süre tanır
const MOVE_DELAY_MS = 300;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * @param {object} io          - Socket.io server instance
 * @param {Map}    activeMatches - Paylaşılan maç haritası (socketHandler ile ortak)
 * @param {string} matchId
 * @param {object} p1          - { teamName }
 * @param {object} p2          - { teamName }
 */
async function simulateMatch(io, activeMatches, matchId, p1, p2) {
  const engine = new GomokuEngine(15);
  const bot1   = new BotRunner(p1.teamName);
  const bot2   = new BotRunner(p2.teamName);

  // Maçı activeMatches'e kaydet (izleyiciler için)
  activeMatches.set(matchId, {
    engine,
    players: {
      1: { id: null, name: p1.teamName },
      2: { id: null, name: p2.teamName },
    },
    startedAt: Date.now(),
    type: 'simulation',
  });

  // match_start yayını
  io.to(matchId).emit('match_start', {
    matchId,
    team1: p1.teamName,
    team2: p2.teamName,
  });

  console.log(`
    [sim] ${matchId} başladı: ${p1.teamName} vs ${p2.teamName}
    [sim] İzleme linki http://localhost:3000/watch/${matchId}
    `);

  let reason = 'normal';
  let moves  = 0;

  try {
    // Botları başlat
    await bot1.start();
    await bot2.start();
    console.log(`[sim] Botlar başlatıldı`);

    // Oyun döngüsü
    while (!engine.isGameOver) {
      const currentPlayer = engine.currentPlayer;
      const currentBot    = currentPlayer === 1 ? bot1 : bot2;
      const teamName      = currentPlayer === 1 ? p1.teamName : p2.teamName;

      // Bot'a gönderilecek state
      const stateForBot = {
        board:     engine.board,
        turn:      engine.currentPlayer,
        role:      currentPlayer,   // botun kendi rengi
        matchId,
        timeLimit: 5,               // saniye
        moveCount: engine.moveCount,
      };

      let move;
      try {
        move = await currentBot.requestMove(stateForBot);
        console.log(`[sim] ${teamName} → (${move.x}, ${move.y})`);
      } catch (err) {
        console.error(`[sim] ${teamName} hamle hatası: ${err.message}`);
        // Geçersiz hamle → otomatik kayıp
        move = { x: -1, y: -1 };
        reason = `${teamName} zaman aşımı`;
      }

      // Engine'e uygula
      const state = engine.playTurn(move.x, move.y);
      moves++;

      // Hamle bilgisini state'e ekle
      const updatePayload = {
        ...state,
        matchId,
        lastMove: { x: move.x, y: move.y, player: currentPlayer },
      };

      // Broadcast
      io.to(matchId).emit('game_update', updatePayload);

      // Görsel gecikme
      if (!engine.isGameOver) {
        await sleep(MOVE_DELAY_MS);
      }
    }

  } catch (err) {
    console.error(`[sim] ${matchId} kritik hata:`, err.message);
    reason = 'hata: ' + err.message;

    // Oyun bitmemişse zorla bitir
    if (!engine.isGameOver) {
      engine.isGameOver = true;
      engine.winner = 'DRAW';
    }

    io.to(matchId).emit('game_update', {
      ...engine.getState(),
      matchId,
      lastMove: null,
    });
  } finally {
    bot1.kill();
    bot2.kill();

    const { winner } = engine;
    const winnerName = winner === 1 ? p1.teamName : winner === 2 ? p2.teamName : 'DRAW';

    io.to(matchId).emit('match_end', {
      matchId,
      winner: winnerName,
      winnerRole: winner,
      reason,
      moves,
    });

    console.log(`[sim] ${matchId} bitti — kazanan: ${winnerName} (${moves} hamle, sebep: ${reason})`);

    // 2 dakika sonra temizle
    setTimeout(() => activeMatches.delete(matchId), 120_000);
  }
}

module.exports = { simulateMatch };