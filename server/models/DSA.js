const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  hidden: { type: Boolean, default: false }
}, { _id: false });

const dsaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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
    type: [String], 
    default: []
  },
  examples: [exampleSchema],
  testCases: [testCaseSchema],
  tags: {
    type: [String],
    index: true,
    default: []
  },
  timeLimit: {
    type: Number,
    default: 5000,
  },
  solveTimeLimit: {
    type: Number,
    default: 20,
  },
  spaceLimit: {
    type: Number,
    default: 1024,
  },
  starterCode: {
    type: Map,
    of: String,
    default: {}
  },
  hints:{
    type: [String],
    default: []
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
    index: true
  }
});


dsaSchema.index({ difficulty: 1 });
dsaSchema.index({ createdAt: -1 });

const DSAModel = mongoose.model('DSA', dsaSchema, 'dsaProblems');
module.exports = DSAModel;
