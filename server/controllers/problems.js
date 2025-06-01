const Frontend = require('../models/frontend');

async function handleFrontendProblems(req, res) {
    try {
        const problems = await Frontend.find({});
        console.log('Frontend problems fetched successfully:', problems.length);
        
        res.status(200).json(problems);
    } catch (error) {
        console.error('Error fetching frontend problems:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    handleFrontendProblems
};