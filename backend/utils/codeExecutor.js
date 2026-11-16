const vm = require('vm');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Execute arbitrary JavaScript code in a safe VM context
 */
function executeJavaScript(code, testCases = [], functionName = null) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const logs = [];

    // Custom console to capture stdout/stderr
    const sandboxConsole = {
      log: (...args) => {
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      error: (...args) => {
        logs.push('[error] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      warn: (...args) => {
        logs.push('[warn] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      info: (...args) => {
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
    };

    const sandbox = {
      console: sandboxConsole,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURI,
      decodeURI,
      encodeURIComponent,
      decodeURIComponent,
    };

    const context = vm.createContext(sandbox);

    try {
      // 1. Run the student's base code
      const script = new vm.Script(code);
      const executionResult = script.runInContext(context, {
        timeout: 2500, // 2.5 second timeout to prevent infinite loops
        displayErrors: true,
      });

      // If no test cases are provided, this is a plain "Run Code" request
      if (!testCases || testCases.length === 0) {
        const executionTime = Date.now() - startTime;
        let output = logs.join('\n');
        if (output.trim() === '' && executionResult !== undefined) {
          output = typeof executionResult === 'object' ? JSON.stringify(executionResult, null, 2) : String(executionResult);
        }
        return resolve({
          success: true,
          output: output || 'Program executed successfully (no output).',
          executionTime,
        });
      }

      // 2. Evaluate test cases against the executed context
      const testResults = [];
      let passedCount = 0;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        let actualOutput = null;
        let passed = false;
        let errorMsg = null;

        try {
          // If test case has input like "sum(2, 3)" or "2, 3"
          let testScriptText;
          if (tc.input && (tc.input.includes('(') || tc.input.includes('='))) {
            testScriptText = tc.input;
          } else if (functionName && tc.input) {
            testScriptText = `${functionName}(${tc.input})`;
          } else if (tc.input) {
            testScriptText = tc.input;
          } else {
            testScriptText = `'test case has no input'`;
          }

          const tcScript = new vm.Script(testScriptText);
          const rawResult = tcScript.runInContext(context, { timeout: 1500 });
          
          actualOutput = typeof rawResult === 'object' && rawResult !== null 
            ? JSON.stringify(rawResult) 
            : String(rawResult);

          const expectedTrimmed = String(tc.expectedOutput).trim();
          const actualTrimmed = String(actualOutput).trim();

          // Compare normalized
          if (expectedTrimmed === actualTrimmed) {
            passed = true;
          } else {
            // Also try comparing parsed JSON if possible
            try {
              if (JSON.stringify(JSON.parse(expectedTrimmed)) === JSON.stringify(JSON.parse(actualTrimmed))) {
                passed = true;
              }
            } catch (_) {}
          }
        } catch (err) {
          errorMsg = err.message;
          actualOutput = `Error: ${err.message}`;
        }

        if (passed) passedCount++;

        testResults.push({
          description: tc.description || `Test Case #${i + 1}`,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput,
          actualOutput: actualOutput || '',
          passed,
          error: errorMsg,
          isHidden: tc.isHidden || false,
        });
      }

      const totalTime = Date.now() - startTime;
      const allPassed = passedCount === testCases.length;

      return resolve({
        success: true,
        allPassed,
        passedCount,
        totalCount: testCases.length,
        testResults,
        logs: logs.join('\n'),
        executionTime: totalTime,
      });

    } catch (err) {
      return resolve({
        success: false,
        error: err.message,
        logs: logs.join('\n'),
        executionTime: Date.now() - startTime,
      });
    }
  });
}

/**
 * Execute Python code via python3 CLI
 */
function executePython(code, testCases = []) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `py_exec_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);

    // Prepare code wrapper if test cases exist
    let fullScript = code;

    if (testCases && testCases.length > 0) {
      // Append a test harness in Python
      const harness = `
import json, sys

__test_cases = ${JSON.stringify(testCases)}
__results = []

for idx, tc in enumerate(__test_cases):
    test_input = tc.get('input', '')
    expected = str(tc.get('expectedOutput', '')).strip()
    try:
        # evaluate the expression
        val = eval(test_input)
        actual = str(val).strip()
        passed = (actual == expected)
        __results.append({
            "description": tc.get("description", f"Test Case #{idx+1}"),
            "input": test_input,
            "expectedOutput": expected,
            "actualOutput": actual,
            "passed": passed,
            "error": None,
            "isHidden": tc.get("isHidden", False)
        })
    except Exception as e:
        __results.append({
            "description": tc.get("description", f"Test Case #{idx+1}"),
            "input": test_input,
            "expectedOutput": expected,
            "actualOutput": f"Error: {str(e)}",
            "passed": False,
            "error": str(e),
            "isHidden": tc.get("isHidden", False)
        })

print("___TEST_RESULTS_START___")
print(json.dumps(__results))
`;
      fullScript = `${code}\n\n${harness}`;
    }

    try {
      fs.writeFileSync(tempFile, fullScript, 'utf8');

      execFile('python3', [tempFile], { timeout: 3000 }, (error, stdout, stderr) => {
        // Clean up temp file
        try { fs.unlinkSync(tempFile); } catch (_) {}

        const executionTime = Date.now() - startTime;

        if (error && error.killed) {
          return resolve({
            success: false,
            error: 'Execution timed out (limit: 3 seconds). Check for infinite loops.',
            executionTime,
          });
        }

        if (testCases && testCases.length > 0) {
          const parts = stdout.split('___TEST_RESULTS_START___');
          const logs = (parts[0] || '').trim();
          const resultsJson = (parts[1] || '').trim();

          let testResults = [];
          if (resultsJson) {
            try {
              testResults = JSON.parse(resultsJson);
            } catch (_) {
              testResults = [];
            }
          }

          const passedCount = testResults.filter(t => t.passed).length;
          const allPassed = testResults.length > 0 && passedCount === testResults.length;

          return resolve({
            success: !error || allPassed,
            allPassed,
            passedCount,
            totalCount: testCases.length,
            testResults,
            logs,
            error: stderr || (error ? error.message : null),
            executionTime,
          });
        }

        // Just run code
        return resolve({
          success: !error,
          output: stdout || stderr || (error ? error.message : 'Execution finished with no output.'),
          error: stderr || null,
          executionTime,
        });
      });
    } catch (writeErr) {
      resolve({
        success: false,
        error: writeErr.message,
        executionTime: Date.now() - startTime,
      });
    }
  });
}

module.exports = {
  executeJavaScript,
  executePython,
};
