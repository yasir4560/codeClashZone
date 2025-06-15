const express = require('express');
const { handleSignUp, handleLogin, handleLogOut } = require('../controllers/user');
const { handleCheckAuth } = require('../controllers/authController');
const router = express.Router();


router.post('/signUp',handleSignUp);
router.post('/login', handleLogin);
router.post('/logout', handleLogOut);

router.get('/me', handleCheckAuth, (req, res) => {
  console.log('req.user:', req.user);
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: no user found' });
  }
  res.status(200).json({userId: req.user.id,name: req.user.name,
  });
});


module.exports = router;