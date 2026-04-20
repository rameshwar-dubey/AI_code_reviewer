/**
 * Pipeline Service - Automatic code review pipeline
 * Integrates: ESLint → AST → ML Model → OpenAI
 */

import axios from "axios";
import { ESLintService } from "./lintService.js";
import { ASTService } from "./astService.js";
import { OpenAI } from "openai";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Main pipeline: analyze code through all stages
 */
export async function analyzeCodePipeline(code, language = "javascript") {
  try {
    console.log("🚀 Starting automatic code review pipeline...");

    // Stage 1: ESLint Analysis
    console.log("📋 Stage 1: ESLint Analysis");
    const lintResults = await ESLintService.lint(code, language);

    // Stage 2: AST Analysis
    console.log("🌳 Stage 2: AST Structural Analysis");
    const astAnalysis = await ASTService.analyze(code, language);

    // Stage 3: ML Model - Quality Score + Risk Level
    console.log("🤖 Stage 3: ML Model Analysis");
    const mlAnalysis = await callMLService(code);

    // Stage 4: OpenAI - Comprehensive Review + Optimized Code
    console.log("🧠 Stage 4: AI Review with OpenAI");
    const aiReview = await generateAIReview(
      code,
      lintResults,
      astAnalysis,
      mlAnalysis,
    );

    // Combine all results
    const pipeline_result = {
      timestamp: new Date().toISOString(),
      language,

      // Errors categorized by type
      errors: {
        lint: lintResults.errors || [],
        structural: astAnalysis.issues || [],
        total_issues:
          (lintResults.errors?.length || 0) + (astAnalysis.issues?.length || 0),
      },

      // ML Scoring
      ml_analysis: {
        score: mlAnalysis.score,
        risk_level: mlAnalysis.risk_level,
        features: mlAnalysis.features,
      },

      // AI Review
      ai_review: {
        explanation: aiReview.explanation,
        suggestions: aiReview.suggestions,
        optimized_code: aiReview.optimized_code,
        confidence: aiReview.confidence,
      },

      // Summary
      summary: {
        total_errors:
          (lintResults.errors?.length || 0) + (astAnalysis.issues?.length || 0),
        quality_score: Math.round(mlAnalysis.score),
        risk_assessment: mlAnalysis.risk_level,
        recommendation: generateRecommendation(
          mlAnalysis.score,
          mlAnalysis.risk_level,
        ),
      },
    };

    console.log("✅ Pipeline complete");
    return pipeline_result;
  } catch (error) {
    console.error("❌ Pipeline error:", error.message);
    throw error;
  }
}

/**
 * Call ML Service for quality scoring
 */
async function callMLService(code) {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/analyze`,
      {
        code,
      },
      {
        timeout: 10000,
      },
    );

    return {
      score: response.data.score || 50,
      risk_level: response.data.risk_level || "Medium",
      features: response.data.features || {},
    };
  } catch (error) {
    console.warn("⚠️ ML Service unavailable, using default scoring");
    return {
      score: 50,
      risk_level: "Medium",
      features: {},
    };
  }
}

/**
 * Generate AI review using OpenAI
 */
async function generateAIReview(code, lintResults, astAnalysis, mlAnalysis) {
  try {
    const errorSummary = formatErrorSummary(lintResults, astAnalysis);

    const prompt = `You are an expert code reviewer. Analyze this code and provide:
1. A concise explanation of issues found
2. Specific suggestions for improvement
3. An optimized version of the code

Code:
\`\`\`
${code}
\`\`\`

Issues found:
${errorSummary}

ML Analysis Score: ${mlAnalysis.score}/100
Risk Level: ${mlAnalysis.risk_level}

Respond in JSON format:
{
  "explanation": "brief explanation of main issues",
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "optimized_code": "improved code here",
  "confidence": 0.95
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert code reviewer and optimizer. Provide concise, actionable reviews and always return valid, working code improvements.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      explanation: content,
      suggestions: [],
      optimized_code: code,
      confidence: 0.8,
    };
  } catch (error) {
    console.error("OpenAI API error:", error.message);
    return {
      explanation: "Unable to generate AI review",
      suggestions: [],
      optimized_code: code,
      confidence: 0,
    };
  }
}

/**
 * Format error summary for AI
 */
function formatErrorSummary(lintResults, astAnalysis) {
  let summary = "";

  if (lintResults.errors && lintResults.errors.length > 0) {
    summary += "Lint Errors:\n";
    lintResults.errors.slice(0, 5).forEach((err) => {
      summary += `- ${err.rule}: ${err.message}\n`;
    });
  }

  if (astAnalysis.issues && astAnalysis.issues.length > 0) {
    summary += "Structural Issues:\n";
    astAnalysis.issues.slice(0, 5).forEach((issue) => {
      summary += `- ${issue.type}: ${issue.message}\n`;
    });
  }

  return summary || "No major issues found";
}

/**
 * Generate recommendation based on score and risk
 */
function generateRecommendation(score, riskLevel) {
  if (riskLevel === "High") {
    return "⚠️ HIGH RISK - Major refactoring needed before production";
  } else if (riskLevel === "Medium") {
    if (score >= 70) {
      return "⚡ MEDIUM RISK - Consider improvements before deployment";
    } else {
      return "⚠️ MEDIUM RISK - Significant improvements needed";
    }
  } else {
    return "✅ LOW RISK - Code is ready for production";
  }
}

/**
 * Chat-based code analysis
 */
export async function chatAboutCode(
  code,
  userMessage,
  language = "javascript",
) {
  try {
    // Quick lint + ML analysis
    const lintResults = await ESLintService.lint(code, language);
    const mlAnalysis = await callMLService(code);

    const codeContext = `Code (${language}):
\`\`\`
${code.substring(0, 1000)}${code.length > 1000 ? "..." : ""}
\`\`\`

Quality Score: ${mlAnalysis.score}/100
Risk Level: ${mlAnalysis.risk_level}
Issues: ${lintResults.errors?.length || 0} found`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert code reviewer and developer. Help users understand and improve their code.",
        },
        {
          role: "user",
          content: `${codeContext}\n\nUser question: ${userMessage}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      response: response.choices[0].message.content,
      code_context: {
        quality_score: mlAnalysis.score,
        risk_level: mlAnalysis.risk_level,
        issues_found: lintResults.errors?.length || 0,
      },
    };
  } catch (error) {
    throw new Error(`Chat analysis failed: ${error.message}`);
  }
}

/**
 * Generate fixed/optimized code
 */
export async function fixCode(
  code,
  language = "javascript",
  specificFix = null,
) {
  try {
    const lintResults = await ESLintService.lint(code, language);

    let fixPrompt = `Fix and optimize this ${language} code:
\`\`\`
${code}
\`\`\``;

    if (lintResults.errors && lintResults.errors.length > 0) {
      fixPrompt += "\n\nFix these specific errors:\n";
      lintResults.errors.slice(0, 5).forEach((err) => {
        fixPrompt += `- ${err.rule}: ${err.message}\n`;
      });
    }

    if (specificFix) {
      fixPrompt += `\n\nSpecific requirement: ${specificFix}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert code optimizer. Return only valid, working code without explanations.",
        },
        {
          role: "user",
          content: fixPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    // Extract code from response
    const fixedCode = extractCode(response.choices[0].message.content);

    return {
      original_code: code,
      fixed_code: fixedCode,
      changes: generateChangesSummary(code, fixedCode),
      language,
    };
  } catch (error) {
    throw new Error(`Code fixing failed: ${error.message}`);
  }
}

/**
 * Extract code from markdown/text response
 */
function extractCode(response) {
  // Try to extract from code blocks
  const codeBlockMatch = response.match(
    /```(?:javascript|js|typescript|ts|python|java)?\n?([\s\S]*?)\n?```/,
  );
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // If no code block, return as-is
  return response.trim();
}

/**
 * Generate summary of changes
 */
function generateChangesSummary(original, fixed) {
  const originalLines = original.split("\n").length;
  const fixedLines = fixed.split("\n").length;

  return {
    lines_changed: Math.abs(originalLines - fixedLines),
    original_lines: originalLines,
    fixed_lines: fixedLines,
    brevity_change:
      fixedLines < originalLines
        ? "shorter"
        : fixedLines > originalLines
          ? "longer"
          : "same",
  };
}
