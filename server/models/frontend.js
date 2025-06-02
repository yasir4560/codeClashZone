const mongoose = require('mongoose');

const frontendSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  tags: [String],
  htmlStarter: String,
  cssStarter: String,
  jsStarter: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ExpectedTimeInMinutes:{
    type: Number,
    default: 30,
    required: true,
  },
  ExpectedOutput:{
    type:String,
  },
  problemType: { 
    type: String, 
    enum: ['Code','Frontend'],
    default: 'Frontend', 
    required: true 
  }


});



const Frontend = mongoose.model('Frontend', frontendSchema);
module.exports = Frontend;