const mongoose = require('mongoose');

const dsaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  constraints: {
    type: String,
  },
  examples: [
    {
      input: { type: String },
      output: { type: String },
      explanation: { type: String },
    }
  ],
  testCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      hidden: { type: Boolean, default: false } 
    }
  ],
  tags: [String], 
  timeLimit: {
    type: Number, 
    default: 5000,
  },
  spaceLimit: {
    type: Number, 
    default: 1024,
  },
  starterCode: {
    type: Map, // Map allows flexible key-value structure
    of: String,
    default: {},
  },
  problemType: { 
    type: String, 
    default: 'DSA', 
    required: true 
  },
  acceptanceRate: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const DSAModel = mongoose.model('DSAProblem', dsaSchema, 'dsaProblems');

module.exports = DSAModel;
