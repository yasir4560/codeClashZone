
const mongoose = require('mongoose');
const Submission = require('../models/submission');
const comments = require('../models/comments');
const User = require('../models/user');

async function getRanks(req, res, next) {
 try {
     const submissionCounts = await Submission.aggregate([
        { $match:{isSuccess : true}},
        {$group: {_id: "$userId", submissions:{$sum:1}}}
     ]);

     const commentsCount = await comments.aggregate([
        {$group:{_id:"$createdBy", comments: {$sum:1}}}
     ]);

     const combinedMap = new Map();

    submissionCounts.forEach(item=>{
        combinedMap.set(item._id.toString(), {_id:  item._id, submissions: item.submissions, comments: 0});
    })

    commentsCount.forEach(item=>{
        const userId = item._id.toString();
        if(combinedMap.has(userId)){
            combinedMap.get(userId).comments = item.comments;
        }else
        {
            combinedMap.set(userId, {_id: item._id, submissions:0, comments: item.comments});
        }
    })

    const combinedArray = Array.from(combinedMap.values()).map(user =>({
        ...user,
        score: user.submissions *10 + user.comments * 2
    }));

    combinedArray.sort((a,b) => b.score - a.score);

    const userIds = combinedArray.map(u => new mongoose.Types.ObjectId(u._id));
    const users = await User.find({_id: {$in:userIds}}, {name:1});


    const leaderboard = combinedArray.map(entry=>{
        const user = users.find(u=>u._id.toString() === entry._id.toString());
        return {
            name: user ? user.name : "Unknown",
            submissions: entry.submissions,
            comments: entry.comments,
            score: entry.score

        };
    });

   res.status(200).json({ success: true, leaderboard });


 } catch (error) {
    console.error("Error in getRanks:", error);
    res.status(500).json({ success: false, message: "Failed to generate leaderboard scores" });
 }
}


module.exports = {
    getRanks,
}