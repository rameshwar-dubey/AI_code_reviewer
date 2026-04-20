/**
 * AST Service - Parses code and traverses Abstract Syntax Tree
 */

import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

/**
 * Parse JavaScript code using Babel parser
 * @param {string} code - Source code to parse
 * @returns {Object} AST or error
 */
export const parseJavaScript = (code) => {
  try {
    const ast = babelParser.parse(code, {
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: ["jsx", "typescript", "asyncGenerators", "classFields"],
    });
    return { ast, error: null };
  } catch (error) {
    return {
      ast: null,
      error: {
        message: error.message,
        line: error.pos ? error.loc?.line : 1,
        column: error.loc?.column || 0,
      },
    };
  }
};

/**
 * Analyze JavaScript AST for code metrics
 * @param {Object} ast - Babel AST
 * @returns {Object} Analysis results
 */
export const analyzeAST = (ast) => {
  const analysis = {
    functions: [],
    variables: [],
    imports: [],
    exports: [],
    complexity: 0,
    depth: 0,
  };

  // Skip AST analysis if traverse is not available
  if (!ast || typeof traverse !== "function") {
    return analysis;
  }

  let maxDepth = 0;

  try {
    traverse(ast, {
      FunctionDeclaration(path) {
        const name = path.node.id?.name || "anonymous";
        const line = path.node.loc?.start.line || 0;
        analysis.functions.push({
          name,
          line,
          complexity: 1,
          params: path.node.params.length,
        });
      },
      VariableDeclarator(path) {
        const name =
          path.node.id.type === "Identifier"
            ? path.node.id.name
            : "destructured";
        const line = path.node.loc?.start.line || 0;
        analysis.variables.push({ name, line });
      },
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers = path.node.specifiers.map((s) => s.local.name);
        analysis.imports.push({ source, specifiers });
      },
    });
    analysis.complexity = Math.max(1, analysis.functions.length);
  } catch (error) {
    console.warn("[AST] Error during AST traversal:", error.message);
  }

  return analysis;
};

/**
 * Extract code snippets and their line numbers
 * @param {string} code - Source code
 * @returns {Object} Code snippets by line
 */
export const getCodeLines = (code) => {
  const lines = code.split("\n");
  return lines.map((line, index) => ({
    lineNumber: index + 1,
    content: line,
    length: line.length,
  }));
};

/**
 * Python code analysis (simplified rule-based approach)
 * @param {string} code - Python source code
 * @returns {Object} Analysis results
 */
export const analyzePython = (code) => {
  const analysis = {
    imports: [],
    functions: [],
    classes: [],
    issues: [],
  };

  const lines = code.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Find imports
    if (trimmed.startsWith("import ") || trimmed.startsWith("from ")) {
      analysis.imports.push({ line: lineNum, content: trimmed });
    }

    // Find function definitions
    if (trimmed.startsWith("def ")) {
      const funcMatch = trimmed.match(/def\s+(\w+)\s*\(/);
      if (funcMatch) {
        analysis.functions.push({
          name: funcMatch[1],
          line: lineNum,
        });
      }
    }

    // Find class definitions
    if (trimmed.startsWith("class ")) {
      const classMatch = trimmed.match(/class\s+(\w+)/);
      if (classMatch) {
        analysis.classes.push({
          name: classMatch[1],
          line: lineNum,
        });
      }
    }

    // Simple issue detection
    if (trimmed.startsWith("print(")) {
      analysis.issues.push({
        line: lineNum,
        severity: "info",
        message: "Consider using logging instead of print()",
      });
    }

    // Check for trailing whitespace
    if (line !== line.trimEnd()) {
      analysis.issues.push({
        line: lineNum,
        severity: "warning",
        message: "Trailing whitespace detected",
      });
    }
  });

  return analysis;
};

/**
 * Main analyze function that dispatches to language-specific analyzers
 */
export const ASTService = {
  async analyze(code, language = "javascript") {
    try {
      if (language === "python") {
        return analyzePython(code);
      } else if (
        language === "javascript" ||
        language === "typescript" ||
        language === "jsx" ||
        language === "tsx"
      ) {
        const { ast, error } = parseJavaScript(code);
        if (error) {
          return { issues: [error] };
        }
        return analyzeAST(ast);
      } else {
        // Fallback for other languages
        return { issues: [] };
      }
    } catch (error) {
      console.error("AST Analysis error:", error);
      return { issues: [{ message: error.message }] };
    }
  },

  parseJavaScript,
  analyzeAST,
  analyzePython,
  getCodeLines,
};
