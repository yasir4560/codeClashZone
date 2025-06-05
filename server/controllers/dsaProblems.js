const DSAModel = require('../models/DSA');
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

    console.log('Using filter:', filter);

    const problems = await DSAModel.find(filter);
    console.log('Found problems:', problems.length);

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
  python: 'python3',
  cpp: 'cpp',
  java: 'java',
  javascript: 'javascript',
  typescript: 'typescript',
  go: 'go',
  rust: 'rust',
};

async function executePiston(language, source, input) {
  try {
    const pistonLang = languagesMap[language];
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

function getFileExtension(language) {
  switch(language) {
    case 'python3': return 'py';
    case 'cpp': return 'cpp';
    case 'java': return 'java';
    case 'javascript': return 'js';
    case 'typescript': return 'ts';
    case 'go': return 'go';
    case 'rust': return 'rs';
    default: return 'txt';
  }
}




function convertInput(descriptiveInput) {
  const lines = descriptiveInput.split('\n');
  let nums = [];
  let target = null;
  
  for (const line of lines) {
    if (line.startsWith('nums =')) {
      const match = line.match(/\[(.*)\]/);
      if (match && match[1]) {
        nums = match[1].split(',').map(s => s.trim());
      }
    } else if (line.startsWith('target =')) {
      const parts = line.split('=');
      if (parts.length === 2) {
        target = parts[1].trim();
      }
    }
  }
  
  if (nums.length === 0 || target === null) {
    throw new Error('Invalid input format');
  }
  return `${nums.length}\n${nums.join(' ')}\n${target}`;
}



async function handleDsaProblemSubmission(req, res) {
  
}



async function handleDsaRunCode(req, res) {
try {
    const { code, language } = req.body;
    const problemId = req.params.id;
    if (!code || !language || !problemId)
      return res.status(400).json({ message: "Code, language, and problemId are required" });

    const problem = await DSAModel.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    const visibleTestCases = (problem.testCases || []).filter((tc) => !tc.hidden);

    const results = [];
    for (const testCase of visibleTestCases) {
      const runResult = await executePiston(language, code, convertInput(testCase.input));
      const output = (runResult.stdout || "").trim();
      const errorOutput = (runResult.stderr || "").trim();

      const passed = !errorOutput && output === testCase.expectedOutput.trim();

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
