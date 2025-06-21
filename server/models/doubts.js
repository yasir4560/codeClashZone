const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true,
    },

    imageUrl:{
        type:String,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true,
    }


},{timestamps:true});

module.exports = mongoose.model("doubts", doubtSchema);