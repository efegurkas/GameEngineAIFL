const express          = require('express');
const router           = express.Router();
const path             = require('path');
const fs               = require('fs');
const { simulateMatch } = require('../engine/matchSimulator');

const BOTS_DIR = path.join(__dirname, '..', 'bots');

let _io, _activeMatches;

router.init = (io, activeMatches) => {
  _io           = io;
  _activeMatches = activeMatches;
};

// POST /api/match/start
router.post('/start', async (req, res) => {
  const { team1, team2 } = req.body;

  if (!team1 || !team2) {
    return res.status(400).json({ message: 'team1 ve team2 gerekli' });
  }
  if (team1 === team2) {
    return res.status(400).json({ message: 'Aynı takım kendi kendine oynayamaz' });
  }

  // Bot dosyalarını kontrol et
  const bot1Path = path.join(BOTS_DIR, team1, 'bot.py');
  const bot2Path = path.join(BOTS_DIR, team2, 'bot.py');

  if (!fs.existsSync(bot1Path)) {
    return res.status(404).json({ message: `${team1} için bot.py bulunamadı` });
  }
  if (!fs.existsSync(bot2Path)) {
    return res.status(404).json({ message: `${team2} için bot.py bulunamadı` });
  }

  const matchId = `match_${Date.now()}`;

  // Maç odasını önceden oluştur (izleyiciler bağlanabilsin)
  // Simülasyon async olarak başlatılır, response hemen döner
  res.json({
    matchId,
    watchUrl: `/watch/${matchId}`,
    team1,
    team2,
    message: 'Maç başlatıldı',
  });

  if (_io){
    _io.to(team1).to(team2).emit('match_invite',{
      matchId : matchId,
      team1 : team1,
      team2 : team2,
      message : 'Maç başladı!'
    });
    
    console.log(`[Popup] ${team1} ve ${team2} takımlarına davet gönderildi.`);
  }

  // Async simülasyon — response'dan sonra başlar
  setImmediate(() => {
    simulateMatch(_io, _activeMatches, matchId, { teamName: team1 }, { teamName: team2 })
      .catch(err => console.error(`[match] ${matchId} simülasyon hatası:`, err));
  });
});

// GET /api/match/active — aktif maçlar listesi
router.get('/active', (req, res) => {
  if (!_activeMatches) return res.json([]);

  const list = [];
  for (const [matchId, match] of _activeMatches.entries()) {
    list.push({
      matchId,
      team1: match.players?.[1]?.name,
      team2: match.players?.[2]?.name,
      type:  match.type || 'live',
      isGameOver: match.engine?.isGameOver || false,
      moveCount: match.engine?.moveCount || 0,
      startedAt: match.startedAt,
      watchUrl: `/watch/${matchId}`,
    });
  }
  res.json(list);
});

// GET /api/match/bots — hangi takımların botu var
router.get('/bots', (req, res) => {
  if (!fs.existsSync(BOTS_DIR)) return res.json([]);

  const teams = fs.readdirSync(BOTS_DIR).filter(name => {
    const botPath = path.join(BOTS_DIR, name, 'bot.py');
    return fs.existsSync(botPath);
  }).map(name => {
    const metaPath = path.join(BOTS_DIR, name, 'meta.json');
    let meta = {};
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch {}
    return { teamName: name, ...meta };
  });

  res.json(teams);
});

module.exports = router;