const express = require('express');
const router = express.Router();
const { getAllDsaProblems, getDsaProblemById } = require('../controllers/dsaProblems');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/',authMiddleware ,getAllDsaProblems);
router.get('/:id', authMiddleware, getDsaProblemById);

module.exports = router;
