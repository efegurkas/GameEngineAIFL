const express = require('express');
const router = express.Router();
const Team = require('../models/Team'); 
const authenticateToken = require('../middleware/auth');

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.user.id).select('-password -botApiKey');

    if (!team) {
      return res.status(404).json({ message: 'Takım bulunamadı.' });
    }

    res.json({
      id: team._id,
      teamName: team.teamName,
      score: team.score || 0,
      wins: team.wins || 0,
      losses: team.losses || 0,
      played: (team.wins || 0) + (team.losses || 0),
      createdAt: team.createdAt
    });
  } catch (err) {
    console.error('[API/me Error]:', err);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});

module.exports = router;