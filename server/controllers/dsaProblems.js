const DSAModel = require('../models/DSA');

async function getAllDsaProblems(req, res) {
  try {
    console.log('Reached getAllDsaProblems controller');
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

module.exports = {
  getAllDsaProblems,
  getDsaProblemById,
};
