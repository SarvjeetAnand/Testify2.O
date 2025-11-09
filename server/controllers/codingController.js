const CodingProblem = require('../models/CodingProblem');
const CodingSubmission = require('../models/CodingSubmission');
const docker = require('../utils/docker');

exports.createProblem = async (req, res) => {
  try {
    const problem = new CodingProblem({
      ...req.body,
      createdBy: req.user._id
    });
    await problem.save();
    res.status(201).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating coding problem'
    });
  }
};

exports.submitSolution = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const problem = await CodingProblem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // For now, without docker, we'll just simulate results
    // In production, you'd use docker.runCode here
    const results = await Promise.all(
      problem.testCases.map(async testCase => {
        // Simulate code execution (replace with actual docker execution)
        // const result = await docker.runCode(code, language, testCase.input);
        // For now, return a mock result
        return {
          passed: false, // Will be determined by actual execution
          executionTime: 0,
          isHidden: testCase.isHidden
        };
      })
    );

    // Save submission
    const submission = new CodingSubmission({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      testCaseResults: results,
      passed: results.every(r => r.passed),
      executionTime: results.reduce((acc, r) => acc + r.executionTime, 0) / results.length || 0
    });

    await submission.save();

    res.status(200).json({
      success: true,
      data: {
        submissionId: submission._id,
        passed: submission.passed,
        results: results.filter(r => !r.isHidden), // Only return visible test cases
        executionTime: submission.executionTime
      }
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting solution'
    });
  }
};

// Get all coding problems for users
exports.getAllProblems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', difficulty = '', category = '' } = req.query;

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = category;
    }

    const problems = await CodingProblem.find(query)
      .populate('category', 'name')
      .select('-testCases') // Don't send test cases to users
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CodingProblem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: problems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding problems'
    });
  }
};

// Get coding problem by ID for users (without hidden test cases)
exports.getProblemById = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id)
      .populate('category', 'name')
      .select('-testCases.isHidden');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Coding problem not found'
      });
    }

    // Only send visible test cases
    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
    const problemData = problem.toObject();
    problemData.testCases = visibleTestCases;

    res.status(200).json({
      success: true,
      data: problemData
    });
  } catch (error) {
    console.error('Get problem by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding problem'
    });
  }
};

// Get user's submissions for a problem
exports.getUserSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const submissions = await CodingSubmission.find({
      user: req.user._id,
      problem: problemId
    })
      .populate('problem', 'title')
      .sort({ submittedAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions'
    });
  }
};

// Get all user submissions
exports.getAllUserSubmissions = async (req, res) => {
  try {
    const submissions = await CodingSubmission.find({
      user: req.user._id
    })
      .populate('problem', 'title difficulty category')
      .populate('problem.category', 'name')
      .sort({ submittedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Get all user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions'
    });
  }
};

// Run code (test without submitting)
exports.runCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const problem = await CodingProblem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Only test against visible test cases
    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
    
    // For now, without docker, we'll return mock results
    // In production, use: const result = await docker.runCode(code, language, testCase.input);
    const results = visibleTestCases.map(testCase => ({
      passed: false, // Will be determined by actual execution
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: '', // Will come from docker execution
      executionTime: 0
    }));

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running code'
    });
  }
};