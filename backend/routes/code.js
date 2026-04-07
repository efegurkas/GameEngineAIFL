const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const router = express.Router();

const BOTS_DIR = path.join(__dirname, '..', 'bots');

router.post('/submit', auth, (req, res) => {
  const { code } = req.body;
  const teamName = req.user.teamName;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'code alanı gerekli' });
  }

  if (code.length > 200_000) {
    return res.status(400).json({ message: 'Kod çok uzun (max 200KB)' });
  }

  const teamDir  = path.join(BOTS_DIR, teamName);
  const botFile  = path.join(teamDir, 'bot.py');
  const metaFile = path.join(teamDir, 'meta.json');

  try {
    fs.mkdirSync(teamDir, { recursive: true });

    if (fs.existsSync(botFile)) {
      const ts = Date.now();
      fs.copyFileSync(botFile, path.join(teamDir, `bot_${ts}.py`));
    }

    fs.writeFileSync(botFile, code, 'utf8');
    fs.writeFileSync(metaFile, JSON.stringify({
      teamName,
      submittedAt: new Date().toISOString(),
      size: code.length,
    }), 'utf8');

    console.log(`[code] ${teamName} kodu güncelledi (${code.length} karakter)`);
    res.json({ message: 'Kod başarıyla kaydedildi', teamName, size: code.length });

  } catch (err) {
    console.error('[code] kayıt hatası:', err);
    res.status(500).json({ message: 'Kod kaydedilemedi' });
  }
});

router.get('/status', auth, (req, res) => {
  const teamName = req.user.teamName;
  const metaFile = path.join(BOTS_DIR, teamName, 'meta.json');

  if (!fs.existsSync(metaFile)) {
    return res.json({ hasCode: false });
  }

  try {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    res.json({ hasCode: true, ...meta });
  } catch {
    res.json({ hasCode: false });
  }
});

module.exports = router; 