const express = require('express');
const router = express.Router();
const softballController = require('../controllers/softballController');

// Get team rankings (NCAA/AP Poll)
router.get('/rankings', softballController.getTeamRankings);

// Get stat leaders for a specific category
router.get('/stats/:category', softballController.getStatLeaders);

// Get games/scoreboard data (optionally for a specific date)
router.get('/games/:date?', softballController.getGames);

module.exports = router;