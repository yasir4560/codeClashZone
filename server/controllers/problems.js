const Frontend = require('../models/frontend');
const Submission = require('../models/submission'); 

async function handleFrontendProblems(req, res) {
  try {
    const problems = await Frontend.find({});

    const enrichedProblems = await Promise.all(
      problems.map(async (problem) => {
        const total = await Submission.countDocuments({
          problemId: problem._id,
          problemType: 'Frontend'
        });

        const success = await Submission.countDocuments({
          problemId: problem._id,
          problemType: 'Frontend',
          isSuccess: true,
        });

        const successRate = total === 0 ? 0 : Math.round((success / total) * 100);

        return {
          ...problem._doc,
          totalSubmissions: total,
          successRate: successRate,
        };
      })
    );

    // console.log('Frontend problems with stats fetched:', enrichedProblems.length);
    res.status(200).json(enrichedProblems);
  } catch (error) {
    console.error('Error fetching frontend problems with stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getProblemById(req, res) {
    try {
    const problem = await Frontend.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function handleSubmit(req, res) {
  try {
    const userId = req.user._id;
    const { problemId } = req.params;

    const {
      problemType,
      codeHtml,
      codeCss,
      codeJs,
      code,
      language,
      timeTakenInSeconds,
    } = req.body;

    if (!problemId || !problemType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let isSuccess = false;
    
    if (problemType === 'Frontend') {
      isSuccess = true; 
    }

    const newSubmission = new Submission({
      userId,
      problemId,
      problemType,
      codeHtml,
      codeCss,
      codeJs,
      code,
      language,
      isSuccess,
      timeTakenInSeconds,
    });

    const savedSubmission = await newSubmission.save();

    res.status(201).json({
      message: 'Submission submitted successfully',
      submission: savedSubmission,
    });
  } catch (error) {
  res.status(500).json({ message: 'Internal server error', error: error.message });
}
}

async function getUserSubmissions(req, res) {
  try {
    const userId = req.params.userId;

    const submissions = await Submission.find({ userId })
      .populate('problemId') 
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = {
  handleFrontendProblems,
  getProblemById,
  handleSubmit,
  getUserSubmissions
};