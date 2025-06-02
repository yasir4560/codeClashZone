const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'problemType', 
  },
  problemType: {
    type: String,
    required: true,
    enum: ['Frontend', 'Code'], 
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  codeHtml: String,
  codeCss: String,
  codeJs: String,
  code: String, 
  language: String, 
  isSuccess: {
    type: Boolean,
    required: true,
  },
  timeTakenInSeconds: Number,
});

const Submission = mongoose.model('submissions', submissionSchema);
module.exports = Submission;
