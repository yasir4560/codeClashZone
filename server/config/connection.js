const mongoose = require('mongoose');

async function connectDB(uri) {
    try{
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    }
    catch(e){
        console.error('MongoDB connection failed:', e.message);
        process.exit(1);
    }
}

module.exports = connectDB;