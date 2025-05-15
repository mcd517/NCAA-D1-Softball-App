const express = require('express');
const router = express.Router();
const softballController = require('../controllers/softballController');

// Get team rankings (AP Poll)
router.get('/rankings', softballController.getTeamRankings);

// Get stat leaders for a specific category
router.get('/stats/:category', softballController.getStatLeaders);

module.exports = router;