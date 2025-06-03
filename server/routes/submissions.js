const express = require('express');
const router = express.Router();

const { handleSubmit, getUserSubmissions } = require('../controllers/problems'); 
const authMiddleware = require('../middleware/authMiddleware');

router.post('/submit/:problemId', authMiddleware, handleSubmit);
router.post('/submissions',authMiddleware ,handleSubmit);
router.get('/:userId/submissions', authMiddleware, getUserSubmissions);

module.exports = router;