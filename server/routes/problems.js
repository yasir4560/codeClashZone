const express = require('express');
const router = express.Router();
const { handleFrontendProblems } = require('../controllers/problems');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/frontend',authMiddleware,handleFrontendProblems);

module.exports = router;
