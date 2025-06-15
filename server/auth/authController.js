const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

function setUser(user){
    const payload = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload,process.env.JWT_SECRET)
};

function getUser(id){
    return jwt.verify(id,process.env.JWT_SECRET);

}

module.exports = {
    setUser,
    getUser
};