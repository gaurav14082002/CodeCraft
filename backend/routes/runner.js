const express = require('express');
const router = express.Router();
const { executeJavaScript, executePython } = require('../utils/codeExecutor');
const { optionalAuth } = require('../middleware/auth');

// @route   POST /api/runner/run
// @desc    Run arbitrary code in sandbox and return stdout/logs
router.post('/run', optionalAuth, async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Please provide code to run',
      });
    }

    let result;
    if (language === 'python') {
      result = await executePython(code);
    } else {
      result = await executeJavaScript(code);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// @route   POST /api/runner/test
// @desc    Test code against a custom set of test cases
router.post('/test', optionalAuth, async (req, res) => {
  try {
    const { code, language = 'javascript', testCases = [], functionName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Please provide code to test',
      });
    }

    let result;
    if (language === 'python') {
      result = await executePython(code, testCases);
    } else {
      result = await executeJavaScript(code, testCases, functionName);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
