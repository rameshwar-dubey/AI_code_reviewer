/**
 * Analyze Controller - Handles code analysis requests
 */

import {
  parseJavaScript,
  analyzeAST,
  analyzePython,
  getCodeLines,
} from "../services/astService.js";
import {
  lintJavaScript,
  lintPython,
  lintJava,
  initESLint,
} from "../services/lintService.js";
import { analyzeCodeRules } from "../services/ruleEngine.js";
import {
  getCodeReview,
  getFixedCode,
  analyzeSecurityVulnerabilities,
  detectAIErrors,
  initOpenAI,
  getErrorsAndOptimizations,
  chatAboutCode,
  assessCodeQuality,
} from "../services/aiService.js";

// Initialize ESLint on startup
await initESLint();

/**
 * Analyze code endpoint handler
 */
export const analyzeCode = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log(
      `[ANALYZE] Language: ${language}, Code length: ${code.length} chars`,
    );

    let issues = [];
    let astAnalysis = null;
    let codeLines = getCodeLines(code);

    if (language === "javascript") {
      // Parse and analyze AST
      const { ast, error: parseError } = parseJavaScript(code);
      if (!parseError) {
        astAnalysis = analyzeAST(ast);
      }

      // Lint code
      const lintIssues = await lintJavaScript(code);
      issues.push(...lintIssues);

      // Check custom rules
      const ruleIssues = analyzeCodeRules(code, "javascript");
      issues.push(...ruleIssues);
    } else if (language === "typescript") {
      // TypeScript uses similar linting to JavaScript
      const { ast, error: parseError } = parseJavaScript(code);
      if (!parseError) {
        astAnalysis = analyzeAST(ast);
      }

      const lintIssues = await lintJavaScript(code);
      issues.push(...lintIssues);

      const ruleIssues = analyzeCodeRules(code, "typescript");
      issues.push(...ruleIssues);
    } else if (language === "python") {
      // Analyze Python code
      astAnalysis = analyzePython(code);

      // Lint Python code
      const lintIssues = lintPython(code);
      issues.push(...lintIssues);

      // Check custom rules
      const ruleIssues = analyzeCodeRules(code, "python");
      issues.push(...ruleIssues);
    } else if (language === "java") {
      // Analyze Java code
      const lintIssues = lintJava(code);
      issues.push(...lintIssues);

      // Check custom rules
      const ruleIssues = analyzeCodeRules(code, "java");
      issues.push(...ruleIssues);
    } else if (language === "cpp") {
      // C++ linting - similar basic checks to Java
      const lintIssues = lintJava(code); // Reuse Java linting for basic syntax
      issues.push(...lintIssues);

      const ruleIssues = analyzeCodeRules(code, "cpp");
      issues.push(...ruleIssues);
    }

    // Add AI-powered error detection
    if (
      process.env.OPENAI_API_KEY &&
      !process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      console.log("[ANALYZE] Running AI-powered error detection...");
      const aiErrors = await detectAIErrors(code, language);
      issues.push(...aiErrors);
    }

    // Remove duplicates
    const uniqueIssues = Array.from(
      new Map(
        issues.map((issue) => [`${issue.line}-${issue.column}`, issue]),
      ).values(),
    );

    console.log(
      `[ANALYZE] Found ${uniqueIssues.length} issues (including AI-detected)`,
    );

    res.json({
      success: true,
      code,
      language,
      issues: uniqueIssues.sort((a, b) => a.line - b.line),
      codeLines,
      astAnalysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get AI-powered code review
 */
export const reviewCode = async (req, res) => {
  try {
    const { code, language = "javascript", issues = [] } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const review = await getCodeReview(code, language, issues);

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get fixed code
 */
export const fixCode = async (req, res) => {
  try {
    const { code, language = "javascript", issues = [] } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log(
      `[FIX] Processing ${language} code with ${issues.length} issues`,
    );

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      console.error("[FIX] OpenAI API key not configured or is placeholder");
      return res.status(400).json({
        success: false,
        error: "OPENAI_API_KEY not configured. Set it in backend/.env file.",
        fixedCode: code,
      });
    }

    const fixedCode = await getFixedCode(code, language, issues);

    console.log(`[FIX] Successfully fixed code`);

    res.json({
      success: true,
      originalCode: code,
      fixedCode,
    });
  } catch (error) {
    console.error("Fix code error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get comprehensive analysis: Errors and Optimization Solutions
 */
export const getComprehensiveAnalysis = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log(
      `[COMPREHENSIVE] Analyzing ${language} code with ${code.length} chars`,
    );

    // First, run standard analysis to get linting issues
    let detectedIssues = [];
    let astAnalysis = null;
    let codeLines = getCodeLines(code);

    if (language === "javascript") {
      const { ast, error: parseError } = parseJavaScript(code);
      if (!parseError) {
        astAnalysis = analyzeAST(ast);
      }

      const lintIssues = await lintJavaScript(code);
      detectedIssues.push(...lintIssues);

      const ruleIssues = analyzeCodeRules(code, "javascript");
      detectedIssues.push(...ruleIssues);
    } else if (language === "typescript") {
      const { ast, error: parseError } = parseJavaScript(code);
      if (!parseError) {
        astAnalysis = analyzeAST(ast);
      }

      const lintIssues = await lintJavaScript(code);
      detectedIssues.push(...lintIssues);

      const ruleIssues = analyzeCodeRules(code, "typescript");
      detectedIssues.push(...ruleIssues);
    } else if (language === "python") {
      astAnalysis = analyzePython(code);

      const lintIssues = lintPython(code);
      detectedIssues.push(...lintIssues);

      const ruleIssues = analyzeCodeRules(code, "python");
      detectedIssues.push(...ruleIssues);
    } else if (language === "java") {
      const lintIssues = lintJava(code);
      detectedIssues.push(...lintIssues);

      const ruleIssues = analyzeCodeRules(code, "java");
      detectedIssues.push(...ruleIssues);
    } else if (language === "cpp") {
      const lintIssues = lintJava(code);
      detectedIssues.push(...lintIssues);

      const ruleIssues = analyzeCodeRules(code, "cpp");
      detectedIssues.push(...ruleIssues);
    }

    // Remove duplicates from linting issues
    const uniqueDetectedIssues = Array.from(
      new Map(
        detectedIssues.map((issue) => [`${issue.line}-${issue.column}`, issue]),
      ).values(),
    );

    console.log(
      `[COMPREHENSIVE] Found ${uniqueDetectedIssues.length} base issues`,
    );

    // Check if API key is available for comprehensive analysis
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      console.warn(
        "[COMPREHENSIVE] OpenAI API key not configured, using basic analysis",
      );

      // Return basic analysis without AI enhancements
      const basicErrors = categorizeErrorsByType(uniqueDetectedIssues);

      return res.json({
        success: true,
        code,
        language,
        codeLines,
        astAnalysis,
        errors: basicErrors,
        optimizations: {
          performance: [],
          readability: [],
          bestPractices: [],
          refactoring: [],
        },
        overview:
          "OpenAI API not configured. For full analysis with AI-powered optimizations, add your OPENAI_API_KEY to backend/.env",
        totalErrors: uniqueDetectedIssues.length,
        totalOptimizations: 0,
        aiEnabled: false,
      });
    }

    // Get comprehensive AI analysis with errors and optimizations
    const analysis = await getErrorsAndOptimizations(
      code,
      language,
      uniqueDetectedIssues,
    );

    console.log(
      `[COMPREHENSIVE] Analysis complete: ${analysis.totalErrors} errors, ${analysis.totalOptimizations} optimizations`,
    );

    res.json({
      success: true,
      code,
      language,
      codeLines,
      astAnalysis,
      errors: analysis.errors,
      optimizations: analysis.optimizations,
      overview: analysis.overview,
      totalErrors: analysis.totalErrors,
      totalOptimizations: analysis.totalOptimizations,
      aiEnabled: true,
    });
  } catch (error) {
    console.error("Comprehensive analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Helper function to categorize errors by type
 */
const categorizeErrorsByType = (issues) => {
  return {
    critical: issues.filter((i) => i.severity === "error").slice(0, 5),
    major: issues.filter((i) => i.severity === "warning").slice(0, 5),
    minor: issues.filter((i) => i.severity === "info").slice(0, 5),
    summary: `Found ${issues.length} issues`,
  };
};

/**
 * Analyze repository (GitHub integration)
 */
export const analyzeRepository = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?/);
    if (!match) {
      return res.status(400).json({ error: "Invalid GitHub URL format" });
    }

    const [, owner, repo] = match;

    try {
      // Fetch repository files using GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN || ""}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const contents = await response.json();

      // Find JavaScript/Python files
      const codeFiles = contents.filter((file) =>
        /\.(js|jsx|ts|tsx|py)$/.test(file.name),
      );

      const fileAnalyses = [];

      for (const file of codeFiles.slice(0, 5)) {
        // Limit to first 5 files
        try {
          const fileResponse = await fetch(file.download_url);
          if (fileResponse.ok) {
            const fileCode = await fileResponse.text();
            const language = file.name.endsWith(".py")
              ? "python"
              : "javascript";

            let issues = [];
            if (language === "javascript") {
              issues = await lintJavaScript(fileCode);
            } else {
              issues = lintPython(fileCode);
            }

            fileAnalyses.push({
              name: file.name,
              path: file.path,
              language,
              issues,
              linesOfCode: fileCode.split("\n").length,
            });
          }
        } catch (fileError) {
          console.error(`Error analyzing ${file.name}:`, fileError);
        }
      }

      res.json({
        success: true,
        repository: {
          owner,
          repo,
          url: repoUrl,
        },
        files: fileAnalyses,
        totalFilesAnalyzed: fileAnalyses.length,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: `Failed to fetch repository: ${error.message}`,
      });
    }
  } catch (error) {
    console.error("Repository analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Security analysis endpoint
 */
export const analyzeSecurityIssues = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const securityIssues = await analyzeSecurityVulnerabilities(code, language);

    res.json({
      success: true,
      securityIssues,
    });
  } catch (error) {
    console.error("Security analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Comprehensive AI-powered analysis with deep learning
 * Identifies errors, patterns, improvements, and best practices
 */
export const deepAnalyzeCode = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      return res.status(400).json({
        success: false,
        error: "OPENAI_API_KEY not configured. Set it in backend/.env file.",
      });
    }

    console.log(`[DEEP-ANALYZE] Starting comprehensive AI analysis...`);

    const client = initOpenAI();

    const prompt = `You are an expert code analyzer. Perform a comprehensive analysis of this ${language} code.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide analysis in this EXACT JSON format (no markdown, pure JSON only):
{
  "summary": "Brief description of what this code does",
  "codeQuality": {
    "score": 75,
    "assessment": "Good code with minor improvements needed"
  },
  "errors": [
    {"line": 5, "severity": "error", "category": "Logic Error", "description": "Variable x may be undefined"}
  ],
  "warnings": [
    {"line": 10, "severity": "warning", "category": "Performance", "description": "Inefficient loop"}
  ],
  "improvements": [
    "Add error handling for edge cases",
    "Simplify nested conditions"
  ],
  "bestPractices": {
    "following": ["Uses const for immutability"],
    "missing": ["Add JSDoc comments", "Add unit tests"]
  },
  "complexity": {
    "cyclomaticComplexity": 4,
    "assessment": "Moderate complexity"
  },
  "performance": {
    "issues": ["N+1 query pattern detected"],
    "suggestions": ["Use pagination", "Add caching"]
  }
}

Return ONLY valid JSON, no markdown or explanations.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "{}";

    // Clean and parse response
    const cleanedResponse = responseText
      .replace(/^```json?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    const analysis = JSON.parse(cleanedResponse);

    console.log(`[DEEP-ANALYZE] Analysis complete`);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Deep analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Chat endpoint for conversational code analysis
 * Allows users to ask questions about their code
 */
export const codeChat = async (req, res) => {
  try {
    const {
      message,
      code,
      language = "javascript",
      analysisResults = null,
    } = req.body;

    if (!message || !code) {
      return res.status(400).json({ error: "Message and code are required" });
    }

    console.log(`[CHAT] User message: "${message.substring(0, 50)}..."`);

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      return res.status(400).json({
        success: false,
        error: "OPENAI_API_KEY not configured",
      });
    }

    const response = await chatAboutCode(
      message,
      code,
      language,
      analysisResults,
    );

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Assess code quality using ML
 * Returns quality score, grade, and recommendations
 */
export const assessQuality = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log(`[QUALITY] Assessing ${language} code quality`);

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      return res.status(400).json({
        success: false,
        error: "OPENAI_API_KEY not configured",
      });
    }

    // Run quick analysis first
    let issues = [];
    if (language === "javascript" || language === "typescript") {
      issues = await lintJavaScript(code);
    } else if (language === "python") {
      issues = lintPython(code);
    } else if (language === "java" || language === "cpp") {
      issues = lintJava(code);
    }

    // Get quality assessment
    const assessment = await assessCodeQuality(code, language, issues);

    res.json({
      success: true,
      assessment,
      issuesCount: issues.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Quality assessment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
