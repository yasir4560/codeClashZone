const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getRanks } = require('../controllers/leaderboardControllers');

const router = express.Router();

router.get("/ranks", authMiddleware, getRanks)

module.exports = router;