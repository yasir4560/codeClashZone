
const doubts = require('../models/doubts');
const comments = require('../models/comments');
const users = require('../models/user');

async function createDoubt(req, res, next){
    //console.log("create doubt called")
  try {
    const {title, description} = req.body;
    const userId = req?.user?._id;
    if(!title || !description || !userId)
    {
       return res.status(400).json({success:false, message:"title, description and id is required"});
    }

    let imageUrl = null;
    if(req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }


    const doubt = await doubts.create({
        title,
        description,
        imageUrl,
        createdBy:userId
    })
   
    return res.status(201).json({
      message: "Doubt created successfully",
      data: doubt
    });
  } catch (error) {
    console.error("Error creating doubt:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function addComment(req, res, next){
   // console.log("add comment called")
  try {
    const {text, doubtId} = req.body;
    const userId = req?.user?._id;
    if(!text|| !userId|| !doubtId)
    {
       return res.status(400).json({success:false, message:"text and userId is required"});
    }

   const comment = await comments.create({ 
    text,
    doubtId,
    createdBy:userId
   })
   
    return res.status(201).json({
      message: "comment added successfully",
      data: comment
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllDoubts(req, res, next){
    console.log("get all doubts called")
  try {
    const alldoubts = await doubts.find({})
    .populate("createdBy", 'name email')
     .sort({"createdAt": -1});
    
    return res.status(200).json({success:true, message:"all doubts fetched successfully", alldoubts})
    
  } catch (error) {
    console.error("Error fetching doubts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllCommentsOnDoubt(req, res, next){
   // console.log(" get all comments called")
    try {

        const doubtId = req.params.id;
        if(!doubtId) return res.status(400).json({message:"post id required"});

        const allComments = await comments.find({doubtId})
        .populate("createdBy", 'name email')
        .sort({"createdAt": -1});

        return res.status(200).json({success:true, message:"all comments fetched successfully", allComments});
        
    } catch (error) {
         console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal server error" });
    }
}

async function getAllUsers(req, res, next){
    console.log("get all users called")
  try {
       const allusers = await users.find({}, 'name email')

     return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users: allusers
    });
  } catch (error) {
     console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
    addComment,
    createDoubt, 
    getAllDoubts,
    getAllUsers,
    getAllCommentsOnDoubt
}