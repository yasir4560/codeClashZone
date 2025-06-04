const express = require('express');
const router = express.Router();
const { getAllDsaProblems, getDsaProblemById, handleDsaProblemSubmission, handleDsaRunCode } = require('../controllers/dsaProblems');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/',authMiddleware ,getAllDsaProblems);
router.get('/:id', authMiddleware, getDsaProblemById);
router.post('/:id/submit', authMiddleware, handleDsaProblemSubmission);
router.post('/:id/run', authMiddleware, handleDsaRunCode);

module.exports = router;
