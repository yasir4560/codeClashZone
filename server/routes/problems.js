const express = require('express');
const router = express.Router();
const { handleFrontendProblems, getProblemById} = require('../controllers/problems');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/frontend',authMiddleware,handleFrontendProblems);
router.get("/:id",authMiddleware ,getProblemById);


module.exports = router;
