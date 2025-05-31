const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { handleProblems } = require('../controllers/problems');


router.get('/problems', authMiddleware, handleProblems);

module.exports = router;