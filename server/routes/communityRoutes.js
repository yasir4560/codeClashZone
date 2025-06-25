
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addComment, createDoubt, getAllDoubts, getAllUsers, getAllCommentsOnDoubt } = require('../controllers/doubtsController');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({storage});

router.post("/createdoubt", authMiddleware, upload.single('image') ,createDoubt);
router.post("/comment", authMiddleware, addComment);
router.get("/alldoubts", authMiddleware, getAllDoubts);
router.get("/allcomments/:id", authMiddleware, getAllCommentsOnDoubt)
router.get("/allusers", authMiddleware, getAllUsers);



module.exports = router;