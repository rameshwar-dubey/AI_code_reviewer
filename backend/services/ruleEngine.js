/**
 * Rule Engine - Custom code analysis rules
 */

/**
 * Analyze code for common bad practices
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Array} Rule violations
 */
export const analyzeCodeRules = (code, language = "javascript") => {
  const violations = [];

  if (language === "javascript" || language === "typescript") {
    violations.push(...checkJavaScriptRules(code));
  } else if (language === "python") {
    violations.push(...checkPythonRules(code));
  } else if (language === "java" || language === "cpp") {
    violations.push(...checkJavaRules(code));
  }

  return violations;
};

/**
 * JavaScript-specific rules
 * @param {string} code - Source code
 * @returns {Array} Violations
 */
const checkJavaScriptRules = (code) => {
  const violations = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Rule 1: Detect console.log in production code
    if (line.includes("console.log") && !line.includes("//")) {
      violations.push({
        line: lineNum,
        column: line.indexOf("console.log") + 1,
        severity: "warning",
        message: "Remove console.log before production",
        ruleId: "no-console",
      });
    }

    // Rule 2: Detect var usage (prefer let/const)
    const varMatch = line.match(/\bvar\s+/);
    if (varMatch && !line.includes("//")) {
      violations.push({
        line: lineNum,
        column: varMatch.index + 1,
        severity: "warning",
        message: 'Prefer "let" or "const" over "var"',
        ruleId: "no-var",
      });
    }

    // Rule 3: Detect function hoisting issues
    if (
      line.includes("function") &&
      line.includes("=") &&
      !line.includes("function(")
    ) {
      // This is a function expression
    }

    // Rule 4: Detect magic numbers
    const magicMatch = line.match(/:\s*(\d{3,}|\d+\.\d+)/);
    if (magicMatch && !line.includes("//")) {
      violations.push({
        line: lineNum,
        column: magicMatch.index + 1,
        severity: "info",
        message: "Consider extracting magic number to a named constant",
        ruleId: "no-magic-numbers",
      });
    }

    // Rule 5: Detect potential null pointer issues
    if (line.includes(".map(") && !line.includes("?.")) {
      violations.push({
        line: lineNum,
        column: line.indexOf(".map(") + 1,
        severity: "warning",
        message: "Consider using optional chaining (?.) before .map()",
        ruleId: "safe-chaining",
      });
    }

    // Rule 6: Detect hardcoded strings (API keys, URLs)
    if (
      (line.includes('"http') ||
        line.includes("'http") ||
        line.includes('"api_key')) &&
      !line.includes("//")
    ) {
      violations.push({
        line: lineNum,
        column: 1,
        severity: "error",
        message:
          "Avoid hardcoding sensitive data or URLs. Use environment variables.",
        ruleId: "no-hardcoded-secrets",
      });
    }

    // Rule 7: Detect async/await without try-catch
    if (
      line.includes("await") &&
      !lines
        .slice(Math.max(0, index - 2), index + 1)
        .some((l) => l.includes("try"))
    ) {
      violations.push({
        line: lineNum,
        column: line.indexOf("await") + 1,
        severity: "warning",
        message: "Consider wrapping await in try-catch block",
        ruleId: "async-error-handling",
      });
    }
  });

  return violations;
};

/**
 * Python-specific rules
 * @param {string} code - Source code
 * @returns {Array} Violations
 */
const checkPythonRules = (code) => {
  const violations = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Rule 1: Line too long
    if (line.length > 79) {
      violations.push({
        line: lineNum,
        column: 80,
        severity: "warning",
        message: "Line exceeds 79 characters (PEP 8)",
        ruleId: "line-too-long",
      });
    }

    // Rule 2: Multiple statements on one line
    if (trimmed.includes(";") && !trimmed.startsWith("#")) {
      violations.push({
        line: lineNum,
        column: line.indexOf(";") + 1,
        severity: "warning",
        message: "Avoid multiple statements on one line",
        ruleId: "multiple-statements",
      });
    }

    // Rule 3: Missing docstring in functions
    if (trimmed.startsWith("def ")) {
      const nextLine = index + 1 < lines.length ? lines[index + 1].trim() : "";
      if (
        !nextLine.startsWith('"""') &&
        !nextLine.startsWith("'''") &&
        !nextLine.startsWith('"""')
      ) {
        violations.push({
          line: lineNum,
          column: 1,
          severity: "info",
          message: "Function should have a docstring",
          ruleId: "missing-docstring",
        });
      }
    }

    // Rule 4: Bare except clause
    if (trimmed === "except:") {
      violations.push({
        line: lineNum,
        column: 1,
        severity: "error",
        message: "Avoid bare except clause. Specify exception type.",
        ruleId: "bare-except",
      });
    }

    // Rule 5: Comparison to None should use 'is'
    if (
      (line.includes("== None") || line.includes("!= None")) &&
      !line.includes("is")
    ) {
      violations.push({
        line: lineNum,
        column:
          line.indexOf("== None") === -1
            ? line.indexOf("!= None") + 1
            : line.indexOf("== None") + 1,
        severity: "warning",
        message: 'Use "is None" or "is not None" for comparison',
        ruleId: "none-comparison",
      });
    }

    // Rule 6: TODO or FIXME comments
    if (line.includes("TODO") || line.includes("FIXME")) {
      violations.push({
        line: lineNum,
        column: Math.max(line.indexOf("TODO"), line.indexOf("FIXME")) + 1,
        severity: "info",
        message: "Address TODO/FIXME before committing",
        ruleId: "fixme-todo",
      });
    }
  });

  return violations;
};

/**
 * Java-specific rules
 * @param {string} code - Source code
 * @returns {Array} Violations
 */
const checkJavaRules = (code) => {
  const violations = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Rule: Check for System.out.println usage
    if (trimmed.includes("System.out.println")) {
      violations.push({
        line: lineNum,
        column: line.indexOf("System.out") + 1,
        severity: "warning",
        message: "Use logging framework instead of System.out",
        ruleId: "no-system-out",
      });
    }

    // Rule: Check for TODO/FIXME
    if (trimmed.includes("TODO") || trimmed.includes("FIXME")) {
      violations.push({
        line: lineNum,
        column: Math.max(line.indexOf("TODO"), line.indexOf("FIXME")) + 1,
        severity: "info",
        message: "Address TODO/FIXME before committing",
        ruleId: "fixme-todo",
      });
    }

    // Rule: Check for hardcoded strings
    if (
      (trimmed.includes('"') || trimmed.includes("'")) &&
      trimmed.includes("=") &&
      !trimmed.startsWith("//")
    ) {
      const stringMatch = trimmed.match(/['"](.*)['"]/);
      if (stringMatch && stringMatch[1].length > 3) {
        violations.push({
          line: lineNum,
          column: 1,
          severity: "info",
          message: "Consider using constants for hardcoded strings",
          ruleId: "hardcoded-strings",
        });
      }
    }
  });

  return violations;
};

/**
 * Get rule documentation
 * @param {string} ruleId - Rule identifier
 * @returns {Object} Rule documentation
 */
export const getRuleDocumentation = (ruleId) => {
  const rules = {
    "no-console":
      "Avoid console.log in production. Use proper logging library.",
    "no-var":
      'Modern JavaScript prefers "let" and "const" over "var" due to better scoping.',
    "no-magic-numbers":
      "Extract magic numbers to named constants for better readability.",
    "safe-chaining":
      "Use optional chaining (?.) to safely access properties that might be null/undefined.",
    "no-hardcoded-secrets":
      "Never hardcode API keys, URLs, or secrets. Use environment variables.",
    "async-error-handling":
      "Always wrap async/await calls in try-catch for error handling.",
    "line-too-long":
      "Keep lines under 79 characters for better readability (PEP 8).",
    "multiple-statements": "Avoid multiple statements on a single line.",
    "missing-docstring":
      "Functions should have docstrings explaining their purpose.",
    "bare-except":
      "Always specify which exception types to catch. Bare except is too broad.",
    "none-comparison":
      'Use "is None" or "is not None" for None comparisons, not == or !=.',
    "fixme-todo": "Address TODO and FIXME comments before committing code.",
  };

  return rules[ruleId] || "No documentation available for this rule.";
};
