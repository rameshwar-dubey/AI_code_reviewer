/**
 * AI Service - Integrates with OpenAI for code review and suggestions
 */

import OpenAI from "openai";

let openaiClient = null;

/**
 * Initialize OpenAI client
 */
export const initOpenAI = () => {
  try {
    if (!openaiClient) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey.includes("placeholder")) {
        console.warn("[AI] OpenAI API key not configured");
        return null;
      }
      openaiClient = new OpenAI({
        apiKey: apiKey,
      });
    }
    return openaiClient;
  } catch (error) {
    console.error("[AI] Failed to initialize OpenAI client:", error);
    return null;
  }
};

/**
 * Get AI-powered code review
 * @param {string} code - Source code to review
 * @param {string} language - Programming language
 * @param {Array} issues - Existing issues found
 * @returns {Promise<Object>} AI review feedback
 */
export const getCodeReview = async (
  code,
  language = "javascript",
  issues = [],
) => {
  try {
    const client = initOpenAI();

    if (!client) {
      return {
        explanation: "OpenAI API key not configured",
        suggestions: [],
        improvedCode: code,
        error: "API key missing",
      };
    }

    const issuesSummary =
      issues.length > 0
        ? `Found ${issues.length} issues:\n${issues
            .map((i) => `Line ${i.line}: [${i.severity}] ${i.message}`)
            .join("\n")}`
        : "No linting issues found";

    const prompt = `You are an expert code reviewer. Analyze the following ${language} code and provide:
1. A brief explanation of what the code does
2. Key improvements and suggestions (focus on the most important ones)
3. Security and performance concerns
4. Best practices to follow

Code:
\`\`\`${language}
${code}
\`\`\`

Linting Results:
${issuesSummary}

Please provide constructive feedback in a structured format.`;

    const message = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const feedback = message.choices[0].message.content || "";

    return {
      explanation: feedback,
      suggestions: extractSuggestions(feedback),
      improvedCode: code, // In production, you'd use Claude to generate improved code
      error: null,
    };
  } catch (error) {
    console.error("AI Service error:", error);
    return {
      explanation: `Error getting AI feedback: ${error.message}`,
      suggestions: [],
      improvedCode: code,
      error: error.message,
    };
  }
};

/**
 * Get fixed/improved code using AI
 * @param {string} code - Source code to fix
 * @param {string} language - Programming language
 * @param {Array} issues - Issues to fix
 * @returns {Promise<string>} Improved code
 */
export const getFixedCode = async (
  code,
  language = "javascript",
  issues = [],
) => {
  try {
    const client = initOpenAI();

    if (!client) {
      return code; // Return original if client not initialized
    }

    const issueDetails = issues
      .slice(0, 5) // Limit to top 5 issues
      .map((i) => `Line ${i.line}: [${i.severity}] ${i.message} (${i.ruleId})`)
      .join("\n");

    const prompt = `You are an expert ${language} developer. Fix the following issues in this code while maintaining its functionality:

Issues to fix:
${issueDetails}

Original Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the fixed code, without any explanation or markdown formatting. The code should:
1. Fix the identified issues
2. Maintain the original functionality
3. Follow ${language} best practices
4. Be production-ready

Fixed Code:`;

    const message = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const fixedCode = message.choices[0].message.content
      ? message.choices[0].message.content.trim()
      : code;

    // Remove markdown code blocks if present
    return fixedCode.replace(/^```[a-z]*\n/, "").replace(/\n```$/, "");
  } catch (error) {
    console.error("Code fix error:", error);
    return code; // Return original on error
  }
};

/**
 * Extract actionable suggestions from AI feedback
 * @param {string} feedback - AI feedback text
 * @returns {Array} Extracted suggestions
 */
const extractSuggestions = (feedback) => {
  const suggestions = [];
  const lines = feedback.split("\n");

  lines.forEach((line) => {
    // Look for bullet points or numbered items
    if (line.match(/^[\d\-•]\s/) || line.match(/^-\s/)) {
      const suggestion = line.replace(/^[\d\-•\s]+/, "").trim();
      if (suggestion.length > 10) {
        suggestions.push(suggestion);
      }
    }
  });

  return suggestions.slice(0, 5); // Return top 5 suggestions
};

/**
 * Analyze code for security vulnerabilities
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Promise<Array>} Security issues
 */
export const analyzeSecurityVulnerabilities = async (
  code,
  language = "javascript",
) => {
  try {
    const client = initOpenAI();

    if (!client) {
      return [];
    }

    const prompt = `Analyze the following ${language} code for security vulnerabilities, data leaks, and unsafe patterns:

\`\`\`${language}
${code}
\`\`\`

List only the actual security issues found, if any. Format each issue as:
- [SEVERITY] Issue Description`;

    const message = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const response = message.choices[0].message.content || "";
    const issues = response
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim());

    return issues;
  } catch (error) {
    console.error("Security analysis error:", error);
    return [];
  }
};

/**
 * Generate explanation for a code snippet
 * @param {string} code - Code snippet
 * @param {string} language - Programming language
 * @returns {Promise<string>} Code explanation
 */
export const explainCode = async (code, language = "javascript") => {
  try {
    const client = initOpenAI();

    if (!client) {
      return "OpenAI API key not configured";
    }

    const prompt = `Explain the following ${language} code in simple terms that a junior developer can understand:

\`\`\`${language}
${code}
\`\`\`

Keep the explanation concise and focus on what the code does, not how.`;

    const message = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return message.choices[0].message.content
      ? message.choices[0].message.content
      : "Unable to explain code";
  } catch (error) {
    console.error("Code explanation error:", error);
    return `Error: ${error.message}`;
  }
};

/**
 * AI-powered error detection using Claude
 * Analyzes code for logical errors, bugs, and potential issues
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Promise<Array>} Array of detected issues in standard format
 */
export const detectAIErrors = async (code, language = "javascript") => {
  try {
    const client = initOpenAI();

    if (!client) {
      return []; // Skip AI analysis if client not initialized
    }

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      return []; // Skip AI analysis if no valid API key
    }

    if (!code.trim() || code.length < 50) {
      return []; // Skip for very short code snippets
    }

    console.log("[AI] Analyzing code for errors using Claude...");

    const prompt = `You are an expert code reviewer. Analyze this ${language} code for:
1. Logic errors and bugs
2. Potential runtime errors
3. Incorrect algorithms or implementations
4. Missing error handling
5. Edge cases not handled
6. Type mismatches or unsafe operations
7. Resource leaks or memory issues
8. Performance bottlenecks

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return ONLY a JSON array with detected issues. Each issue must have:
- line: line number where the issue appears
- column: column number
- message: description of the issue
- severity: "error" or "warning"
- type: category of issue (logic, runtime, algorithm, etc.)

Example format:
[
  {"line": 5, "column": 10, "message": "Null pointer exception: variable not checked", "severity": "error", "type": "runtime"},
  {"line": 12, "column": 1, "message": "Infinite loop detected", "severity": "error", "type": "logic"}
]

Return empty array [] if no issues found. RETURN ONLY VALID JSON, NO MARKDOWN.`;

    const message = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.choices[0].message.content || "[]";

    // Parse the JSON response
    let aiIssues = [];
    try {
      // Clean up the response (remove markdown code blocks if present)
      const cleanedResponse = responseText
        .replace(/^```json?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

      aiIssues = JSON.parse(cleanedResponse);

      // Validate and format issues
      aiIssues = Array.isArray(aiIssues)
        ? aiIssues.map((issue) => ({
            line: parseInt(issue.line) || 1,
            column: parseInt(issue.column) || 1,
            message: issue.message || "AI detected issue",
            severity: issue.severity || "warning",
            ruleId: `ai-${issue.type || "error"}`,
            source: "ai",
          }))
        : [];

      console.log(`[AI] Found ${aiIssues.length} AI-detected issues`);
    } catch (parseError) {
      console.error("[AI] Failed to parse AI response:", parseError);
      console.error("[AI] Raw response:", responseText);
      aiIssues = [];
    }

    return aiIssues;
  } catch (error) {
    console.error("AI error detection failed:", error);
    return [];
  }
};

/**
 * Get optimization solutions for code improvements
 * Focuses on performance, readability, and best practices
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} issues - Existing detected issues
 * @returns {Promise<Object>} Optimization recommendations
 */
export const getOptimizationSolutions = async (
  code,
  language = "javascript",
  issues = [],
) => {
  try {
    const client = initOpenAI();

    if (!client) {
      return {
        performance: [],
        readability: [],
        bestPractices: [],
        refactoring: [],
      };
    }

    const issueContext =
      issues.length > 0
        ? `\n\nExisting Issues Found:\n${issues
            .slice(0, 5)
            .map((i) => `- Line ${i.line}: ${i.message}`)
            .join("\n")}`
        : "";

    const prompt = `You are a senior software engineer specializing in code optimization. Analyze this ${language} code and provide specific optimization recommendations ONLY. Do NOT repeat issues already listed.

Code to optimize:
\`\`\`${language}
${code}
\`\`\`
${issueContext}

Return a JSON object with four categories of optimizations:
1. **performance**: Speed and memory efficiency improvements (with estimated impact: high/medium/low)
2. **readability**: Clearer, more maintainable code patterns
3. **bestPractices**: Modern best practices and conventions for ${language}
4. **refactoring**: Code structure improvements (patterns, DRY principle, etc.)

For each optimization, provide:
- "suggestion": The specific recommendation
- "reason": Why this matters
- "example": Brief code example (if applicable)
- "impact": high/medium/low

Return ONLY valid JSON, no markdown. Example:
{
  "performance": [
    {"suggestion": "...", "reason": "...", "example": "...", "impact": "high"}
  ],
  "readability": [...],
  "bestPractices": [...],
  "refactoring": [...]
}`;

    const message = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.choices[0].message.content || "{}";

    try {
      // Clean up the response
      const cleanedResponse = responseText
        .replace(/^```json?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

      const optimizations = JSON.parse(cleanedResponse);
      console.log("[AI] Generated optimization solutions");
      return optimizations;
    } catch (parseError) {
      console.error("[AI] Failed to parse optimization response:", parseError);
      return {
        performance: [],
        readability: [],
        bestPractices: [],
        refactoring: [],
      };
    }
  } catch (error) {
    console.error("Optimization analysis error:", error);
    return {
      performance: [],
      readability: [],
      bestPractices: [],
      refactoring: [],
    };
  }
};

/**
 * Comprehensive analysis: Errors and Optimization Solutions
 * Returns categorized errors and optimization recommendations
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} detectedIssues - Issues from linting/AST analysis
 * @returns {Promise<Object>} Comprehensive analysis with errors and optimizations
 */
export const getErrorsAndOptimizations = async (
  code,
  language = "javascript",
  detectedIssues = [],
) => {
  try {
    const client = initOpenAI();

    if (!client) {
      return {
        errors: {
          critical: [],
          major: [],
          minor: [],
          summary: "API key not configured",
        },
        optimizations: {
          performance: [],
          readability: [],
          bestPractices: [],
          refactoring: [],
        },
        overview: null,
      };
    }

    console.log(
      "[ANALYZE] Starting comprehensive error and optimization analysis...",
    );

    // Get AI-powered error analysis
    const aiErrors = await detectAIErrors(code, language);

    // Combine all errors
    const allErrors = [...detectedIssues, ...aiErrors];

    // Categorize errors by severity
    const categorizedErrors = categorizeAndSummarizeIssues(allErrors);

    // Get optimization solutions
    const optimizations = await getOptimizationSolutions(
      code,
      language,
      detectedIssues,
    );

    // Generate overview summary
    const overviewPrompt = `Based on this ${language} code analysis:
- Errors: ${allErrors.length} (${categorizedErrors.critical.length} critical, ${categorizedErrors.major.length} major)
- Code quality: Needs improvement based on errors
- Optimization opportunities: ${(optimizations.performance || []).length + (optimizations.readability || []).length + (optimizations.bestPractices || []).length + (optimizations.refactoring || []).length} found

Provide a 2-3 sentence executive summary of the code quality and recommended next steps.`;

    const overviewMessage = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: overviewPrompt,
        },
      ],
    });

    const overview = overviewMessage.choices[0].message.content || "";

    return {
      errors: categorizedErrors,
      optimizations,
      overview,
      totalErrors: allErrors.length,
      totalOptimizations:
        (optimizations.performance?.length || 0) +
        (optimizations.readability?.length || 0) +
        (optimizations.bestPractices?.length || 0) +
        (optimizations.refactoring?.length || 0),
    };
  } catch (error) {
    console.error("Comprehensive analysis error:", error);
    return {
      errors: {
        critical: [],
        major: [],
        minor: [],
        summary: error.message,
      },
      optimizations: {
        performance: [],
        readability: [],
        bestPractices: [],
        refactoring: [],
      },
      overview: null,
    };
  }
};

/**
 * Helper function to categorize and summarize issues
 * @param {Array} issues - All detected issues
 * @returns {Object} Categorized issues with summary
 */
const categorizeAndSummarizeIssues = (issues) => {
  const categorized = {
    critical: [], // Errors that will cause crashes
    major: [], // Errors that affect functionality
    minor: [], // Warnings and style issues
  };

  issues.forEach((issue) => {
    // Map severity to categories
    if (issue.severity === "error") {
      // Check if it's a critical error type
      if (
        issue.ruleId &&
        ["no-undef", "no-func-assign", "ai-runtime", "ai-logic"].includes(
          issue.ruleId,
        )
      ) {
        categorized.critical.push(issue);
      } else {
        categorized.major.push(issue);
      }
    } else {
      categorized.minor.push(issue);
    }
  });

  // Limit each category to top issues
  categorized.critical = categorized.critical.slice(0, 5);
  categorized.major = categorized.major.slice(0, 5);
  categorized.minor = categorized.minor.slice(0, 5);

  // Create summary
  const summary = `Found ${issues.length} total issues: ${categorized.critical.length} critical, ${categorized.major.length} major, ${categorized.minor.length} minor/warnings`;

  return {
    ...categorized,
    summary,
  };
};

/**
 * AI-powered chat for code analysis and Q&A
 * Maintains context about the analyzed code
 * @param {string} message - User's question or comment
 * @param {string} code - The code being discussed
 * @param {string} language - Programming language
 * @param {Array} analysisResults - Previous analysis results for context
 * @returns {Promise<string>} AI response
 */
export const chatAboutCode = async (
  message,
  code,
  language = "javascript",
  analysisResults = null,
) => {
  try {
    const client = initOpenAI();

    if (!client) {
      return "OpenAI API key not configured. Cannot process chat requests.";
    }

    // Build context from analysis results
    let contextInfo = "";
    if (analysisResults) {
      const errors = analysisResults.errors || {};
      contextInfo = `
Previous Analysis Context:
- Total Issues: ${errors.summary || "unknown"}
- Critical Issues: ${(errors.critical || []).length}
- Major Issues: ${(errors.major || []).length}
- Minor Issues: ${(errors.minor || []).length}`;
    }

    const prompt = `You are an expert ${language} code reviewer and developer. A user is asking you about their code. 
    
User's Question: "${message}"

Code being discussed:
\`\`\`${language}
${code}
\`\`\`
${contextInfo}

Based on the code and the user's question, provide a helpful, specific response. If the question is about code improvements, provide concrete examples. If asking for explanations, be clear and concise. Use code snippets where appropriate.`;

    const response = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer assistant. You help developers understand, improve, and debug their code. 
You provide practical, actionable advice with code examples. Be supportive and educational.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return (
      response.choices[0].message.content || "Unable to process your question."
    );
  } catch (error) {
    console.error("Chat error:", error);
    return `Error processing your question: ${error.message}`;
  }
};

/**
 * ML-based code quality assessment
 * Provides a detailed report of code quality metrics
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} issues - Detected issues
 * @returns {Promise<Object>} Quality assessment
 */
export const assessCodeQuality = async (
  code,
  language = "javascript",
  issues = [],
) => {
  try {
    const client = initOpenAI();

    if (!client) {
      return {
        score: 0,
        grade: "N/A",
        assessment: "API not configured",
      };
    }

    const codeLength = code.split("\n").length;
    const issueCount = issues.length;
    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;

    const prompt = `Assess the code quality of this ${language} code:

Code Stats:
- Lines: ${codeLength}
- Issues: ${issueCount} (${errorCount} errors, ${warningCount} warnings)

Code:
\`\`\`${language}
${code}
\`\`\`

Return a JSON assessment with:
{
  "score": (0-100 quality score),
  "grade": ("A" | "B" | "C" | "D" | "F"),
  "strengths": ["list of strong points"],
  "weaknesses": ["list of weak points"],
  "maintainability": (0-100),
  "performance": (0-100),
  "security": (0-100),
  "recommendation": "key action to improve code"
}

Return ONLY valid JSON.`;

    const response = await client.chat.completions.create({
      model: "gpt-4",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = response.choices[0].message.content || "{}";

    try {
      const cleanedResponse = responseText
        .replace(/^```json?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

      const assessment = JSON.parse(cleanedResponse);
      return assessment;
    } catch (parseError) {
      console.error("Failed to parse quality assessment:", parseError);
      return {
        score: Math.max(0, 100 - issueCount * 5),
        grade: issueCount === 0 ? "A" : issueCount < 5 ? "B" : "C",
        assessment: "Assessment generated",
      };
    }
  } catch (error) {
    console.error("Quality assessment error:", error);
    return {
      score: 0,
      grade: "N/A",
      assessment: `Error: ${error.message}`,
    };
  }
};
