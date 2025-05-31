const express = require('express');
const { handleSignUp, handleLogin, handleLogOut } = require('../controllers/user');
const router = express.Router();


router.post('/signUp',handleSignUp);
router.post('/login', handleLogin);
router.post('/logout', handleLogOut);


module.exports = router;