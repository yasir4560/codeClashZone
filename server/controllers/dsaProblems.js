const DSAModel = require('../models/DSA');
const Submission = require('../models/submission');  
const axios = require('axios');

async function getAllDsaProblems(req, res) {
  try {
    // console.log('Reached getAllDsaProblems controller');
    const { tags } = req.query;

    let filter = {};
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    // console.log('Using filter:', filter);

    const problems = await DSAModel.find(filter);
    // console.log('Found problems:', problems.length);

    res.status(200).json(problems);
  } catch (error) {
    console.error('Error fetching DSA problems:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}



async function getDsaProblemById(req, res) {
  try {
    const problem = await DSAModel.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.status(200).json(problem);
  } catch (error) {
    console.error('Error fetching DSA problem by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const languagesMap = {
  python: "python3",
  cpp: "cpp",
  java: "java"
};

function getFileExtension(lang) {
  switch (lang) {
    case "python3": return "py";
    case "cpp": return "cpp";
    case "java": return "java";
    default: return "txt";
  }
}

async function executePiston(language, source, input) {
  try {
    const pistonLang = languagesMap[language.toLowerCase()];
    if (!pistonLang) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const payload = {
      version: '*',
      language: pistonLang,
      files: [
        {
          name: "Main." + getFileExtension(pistonLang),
          content: source,
        },
      ],
      stdin: input,  
    };

    console.log("Piston payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post('https://emkc.org/api/v2/piston/execute', payload, {
      timeout: 10000,
    });

    console.log("Piston response data:", response.data);
    return response.data.run;
  } catch (error) {
    console.error('Error executing code with Piston:', error.response?.data || error.message);
    return { stdout: '', stderr: error.response?.data?.message || error.message };
  }
}

function convertInput(input) {
  if (typeof input === 'object') {
    return JSON.stringify(input);
  }
  else if (typeof input === 'string') {
    return input;
  }
  else if (typeof input === 'number') {
    return input.toString();
  }
  else if (Array.isArray(input)) {
    return input.join('\n');
  }
  else {
    return String(input);
  }

}



function normalizeOutput(str) {
  // Remove all whitespace
  return str.replace(/\s+/g, '');
}

async function handleDsaProblemSubmission(req, res) {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language, timeTakenInSeconds } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).json({ message: "Problem ID, code, and language are required" });
    }
    const problem = await DSAModel.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    const allTestCases = problem.testCases || [];
    const results = [];

    for (const testCase of allTestCases) {
      const inputStr = convertInput(testCase.input);
      const runResult = await executePiston(language, code, inputStr);
      const output = (runResult.stdout || "").trim();
      const errorOutput = (runResult.stderr || "").trim();

      const passed = !errorOutput && 
        normalizeOutput(output) === normalizeOutput(testCase.expectedOutput.trim());

      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput.trim(),
        actual: output,
        error: errorOutput || null,
        passed,
        hidden: testCase.hidden || false,
      });
    }
    const isSuccess = results.every(result => result.passed);
    const newSubmission = {
      userId,
      problemId,
      code,
      language,
      results,
      isSuccess,
      problemType: problem.problemType,
      timeTakenInSeconds: timeTakenInSeconds || 0,
    };
    const submission = new Submission(newSubmission);
    await submission.save();
    res.status(201).json({
      message: "Submission submitted successfully",
      submission: newSubmission,
      results,
    });
  } catch (error) {
    console.error("Error in handleDsaProblemSubmission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function handleDsaRunCode(req, res) {
  try {
    const { code, language } = req.body;
    const problemId = req.params.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({ message: "Code, language, and problemId are required" });
    }

    const problem = await DSAModel.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const visibleTestCases = (problem.testCases || []).filter(tc => !tc.hidden);

    const results = [];
    for (const testCase of visibleTestCases) {
      const inputStr = convertInput(testCase.input);
      const runResult = await executePiston(language, code, inputStr);
      const output = (runResult.stdout || "").trim();
      const errorOutput = (runResult.stderr || "").trim();

      const passed = !errorOutput &&
        normalizeOutput(output) === normalizeOutput(testCase.expectedOutput.trim());

      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput.trim(),
        actual: output,
        error: errorOutput || null,
        passed,
      });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error in handleDsaRunCode:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  getAllDsaProblems,
  getDsaProblemById,
  handleDsaProblemSubmission,
  handleDsaRunCode
};
