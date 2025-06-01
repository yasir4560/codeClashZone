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
  ExpectedOutput:{
    type:String,
  }

});



const Frontend = mongoose.model('Frontend', frontendSchema);
module.exports = Frontend;