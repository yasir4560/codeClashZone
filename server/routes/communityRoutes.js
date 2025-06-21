
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addComment, createDoubt, getAllDoubts, getAllUsers, getAllCommentsOnDoubt } = require('../controllers/doubtsController');
const router = express.Router();


router.post("/createdoubt", authMiddleware, createDoubt);
router.post("/comment", authMiddleware, addComment);
router.get("/alldoubts", authMiddleware, getAllDoubts);
router.get("/allcomments/:id", authMiddleware, getAllCommentsOnDoubt)
router.get("/allusers", authMiddleware, getAllUsers);



module.exports = router;