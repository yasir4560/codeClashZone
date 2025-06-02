const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    role:{
        type:String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{timestamps: true});

// const User = mongoose.model('users', userSchema);
const User = mongoose.models['users'] || mongoose.model('users', userSchema);
module.exports = User;

module.exports = User;