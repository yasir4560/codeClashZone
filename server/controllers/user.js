const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { setUser } = require('../auth/authController');
const { sendWelcomeEmail } = require('../mail/mailService');

async function handleSignUp(req,res){
    const {name,email,password} = req.body;
    try{
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
       await User.create({
            name,
            email,
            password: hashedPassword
        });
        await sendWelcomeEmail(email, name);
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (error) {
        console.error('Error during sign up:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function handleLogin(req,res){
    const {email, password} = req.body;
    try{
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const passwordValidate = await bcrypt.compare(password,user.password);
        if (!passwordValidate) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = setUser(user);
        res.cookie('token',token,{httpOnly:true, maxAge: 24 * 60 * 60 * 1000});
        res.status(200).json({ message: 'Login successful', user: { userId: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch(err){
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

async function handleLogOut(req,res){
    res.clearCookie('token', { httpOnly: true });
    res.status(200).json({ message: 'Logged out successfully' });
}

module.exports={
    handleSignUp,
    handleLogin,
    handleLogOut
}