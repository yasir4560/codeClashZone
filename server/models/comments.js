const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({

    text:{
    type:String,
    required:true,
    },
    
    doubtId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'doubts',
        required:true,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true,
    }


}, {timestamps:true});

module.exports = mongoose.model("comments", commentSchema);