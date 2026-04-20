/**
 * Lint Service - Uses ESLint to find issues
 */

import { ESLint } from "eslint";

// Initialize ESLint instance
let eslintInstance = null;

/**
 * Initialize ESLint
 */
export const initESLint = async () => {
  try {
    eslintInstance = new ESLint({
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2021,
          sourceType: "module",
          ecmaFeatures: {
            jsx: true,
          },
        },
        env: {
          browser: true,
          es2021: true,
          node: true,
        },
        rules: {
          "no-unused-vars": "warn",
          "no-console": "warn",
          "no-debugger": "error",
          "no-var": "warn",
          "prefer-const": "warn",
          semi: "warn",
          quotes: ["warn", "single"],
          indent: ["warn", 2],
          "comma-dangle": "warn",
          "no-trailing-spaces": "warn",
          "no-multiple-empty-lines": "warn",
          "eol-last": "warn",
          "no-undef": "error",
          "no-func-assign": "error",
        },
      },
      useEslintrc: false,
    });
  } catch (error) {
    console.error("Failed to initialize ESLint:", error);
  }
};

/**
 * Lint JavaScript code
 * @param {string} code - Source code to lint
 * @returns {Promise<Array>} Lint issues
 */
export const lintJavaScript = async (code) => {
  try {
    if (!eslintInstance) {
      await initESLint();
    }

    const results = await eslintInstance.lintText(code);

    if (results.length === 0) {
      return [];
    }

    const issues = [];
    results[0].messages.forEach((msg) => {
      issues.push({
        line: msg.line,
        column: msg.column,
        endColumn: msg.endColumn || msg.column + 1,
        severity: msg.severity === 2 ? "error" : "warning",
        message: msg.message,
        ruleId: msg.ruleId,
      });
    });

    return issues;
  } catch (error) {
    console.error("Linting error:", error);
    return [
      {
        line: 1,
        column: 1,
        endColumn: 2,
        severity: "error",
        message: `Linting failed: ${error.message}`,
      },
    ];
  }
};

/**
 * Lint Python code using rule-based approach
 * @param {string} code - Python source code
 * @returns {Array} Lint issues
 */
export const lintPython = (code) => {
  const issues = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Check for unused imports (simplified)
    if (trimmed.startsWith("import ")) {
      // This is a simplified check - real linting would need deeper analysis
    }

    // Check line length
    if (line.length > 79) {
      issues.push({
        line: lineNum,
        column: 80,
        endColumn: line.length,
        severity: "warning",
        message: "Line too long (> 79 characters)",
      });
    }

    // Check for tabs
    if (line.includes("\t")) {
      issues.push({
        line: lineNum,
        column: line.indexOf("\t") + 1,
        endColumn: line.indexOf("\t") + 2,
        severity: "warning",
        message: "Use spaces instead of tabs",
      });
    }

    // Check for print statements
    if (trimmed.startsWith("print(") && !trimmed.includes("# ")) {
      issues.push({
        line: lineNum,
        column: 1,
        endColumn: trimmed.indexOf("(") + 1,
        severity: "info",
        message: "Consider using logging instead of print()",
      });
    }

    // Check for missing docstrings in functions
    if (trimmed.startsWith("def ") && index + 1 < lines.length) {
      const nextLine = lines[index + 1].trim();
      if (!nextLine.startsWith('"""') && !nextLine.startsWith("'''")) {
        // Optionally warn about missing docstring
      }
    }
  });

  return issues;
};

/**
 * Lint Java code using rule-based approach
 * @param {string} code - Java source code
 * @returns {Array} Lint issues
 */
export const lintJava = (code) => {
  const issues = [];
  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith("//") || trimmed === "") return;

    // Check for missing semicolons at end of statements
    if (
      trimmed &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(",") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("/") &&
      !trimmed.endsWith(";") &&
      !trimmed.includes("class ") &&
      !trimmed.includes("interface ") &&
      !trimmed.includes("if ") &&
      !trimmed.includes("for ") &&
      !trimmed.includes("while ") &&
      !trimmed.includes("else")
    ) {
      if (
        trimmed.includes("=") ||
        trimmed.includes("return") ||
        trimmed.includes("print")
      ) {
        issues.push({
          line: lineNum,
          column: line.length,
          endColumn: line.length + 1,
          severity: "error",
          message: "Missing semicolon at end of statement",
          ruleId: "missing-semicolon",
        });
      }
    }

    // Check for main method signature
    if (trimmed.includes("public static void main")) {
      if (!trimmed.includes("String[]")) {
        issues.push({
          line: lineNum,
          column: trimmed.indexOf("String") + 1,
          endColumn: trimmed.indexOf("args") + 4,
          severity: "error",
          message: "main method parameter should be String[] args",
          ruleId: "main-signature",
        });
      }
    }

    // Check for missing braces
    if (
      (trimmed.startsWith("if") ||
        trimmed.startsWith("for") ||
        trimmed.startsWith("while")) &&
      !trimmed.includes("{")
    ) {
      const nextLine = index + 1 < lines.length ? lines[index + 1] : "";
      if (!nextLine.trim().startsWith("{")) {
        issues.push({
          line: lineNum,
          column: 1,
          endColumn: trimmed.length,
          severity: "warning",
          message: "Consider using braces for control structures",
          ruleId: "missing-braces",
        });
      }
    }

    // Check for line length
    if (line.length > 120) {
      issues.push({
        line: lineNum,
        column: 120,
        endColumn: line.length,
        severity: "info",
        message: "Line too long (> 120 characters)",
        ruleId: "line-too-long",
      });
    }

    // Check for tabs
    if (line.includes("\t")) {
      issues.push({
        line: lineNum,
        column: line.indexOf("\t") + 1,
        endColumn: line.indexOf("\t") + 2,
        severity: "warning",
        message: "Use spaces instead of tabs",
        ruleId: "no-tabs",
      });
    }
  });

  // Check for matching braces
  let openBraces = 0;
  for (const line of lines) {
    for (const char of line) {
      if (char === "{") openBraces++;
      if (char === "}") openBraces--;
    }
  }

  if (openBraces > 0) {
    issues.push({
      line: lines.length,
      column: 1,
      endColumn: 2,
      severity: "error",
      message: `Missing ${openBraces} closing brace(s)`,
      ruleId: "missing-braces",
    });
  } else if (openBraces < 0) {
    issues.push({
      line: lines.length,
      column: 1,
      endColumn: 2,
      severity: "error",
      message: `Extra ${Math.abs(openBraces)} closing brace(s)`,
      ruleId: "extra-braces",
    });
  }

  return issues;
};

/**
 * Get severity icon for markers
 * @param {string} severity - Severity level
 * @returns {number} Monaco MarkerSeverity
 */
export const getSeverityLevel = (severity) => {
  const severityMap = {
    error: 8,
    warning: 4,
    info: 2,
    hint: 1,
  };
  return severityMap[severity] || 2;
};

/**
 * Main ESLintService export
 */
export const ESLintService = {
  async lint(code, language = 'javascript') {
    try {
      if (language === 'python') {
        return { errors: lintPython(code) };
      } else if (language === 'java') {
        return { errors: lintJava(code) };
      } else {
        // Default to JavaScript/TypeScript
        return { errors: await lintJavaScript(code) };
      }
    } catch (error) {
      console.error('Linting error:', error);
      return {
        errors: [{
          line: 1,
          column: 1,
          severity: 'error',
          message: `Linting failed: ${error.message}`
        }]
      };
    }
  },

  lintJavaScript,
  lintPython,
  lintJava,
  getSeverityLevel,
  initESLint
};
