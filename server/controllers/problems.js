async function handleProblems(req, res) {
    try {
        // Simulate fetching problems from a database
        const problems = [
            { id: 1, title: 'Problem 1', description: 'Description of problem 1' },
            { id: 2, title: 'Problem 2', description: 'Description of problem 2' },
        ];
        res.status(200).json(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {handleProblems};