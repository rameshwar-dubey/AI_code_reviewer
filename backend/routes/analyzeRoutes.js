/**
 * Routes - API endpoints for code analysis
 */

import express from "express";
import {
  analyzeCode,
  reviewCode,
  fixCode,
  analyzeRepository,
  analyzeSecurityIssues,
  deepAnalyzeCode,
  getComprehensiveAnalysis,
  codeChat,
  assessQuality,
} from "../controllers/analyzeController.js";

const router = express.Router();

/**
 * POST /analyze
 * Analyze code for issues and linting problems
 * Body: { code, language }
 */
router.post("/analyze", analyzeCode);

/**
 * POST /review
 * Get AI-powered code review
 * Body: { code, language, issues }
 */
router.post("/review", reviewCode);

/**
 * POST /fix
 * Get fixed/improved code
 * Body: { code, language, issues }
 */
router.post("/fix", fixCode);

/**
 * POST /analyze-repo
 * Analyze GitHub repository
 * Body: { repoUrl }
 */
router.post("/analyze-repo", analyzeRepository);

/**
 * POST /security
 * Analyze code for security vulnerabilities
 * Body: { code, language }
 */
router.post("/security", analyzeSecurityIssues);

/**
 * POST /deep-analyze
 * Comprehensive AI analysis with ML-based pattern detection
 * Returns code quality metrics, error analysis, and improvement suggestions
 * Body: { code, language }
 */
router.post("/deep-analyze", deepAnalyzeCode);

/**
 * POST /comprehensive-analysis
 * Get comprehensive analysis with errors and optimization solutions
 * Returns categorized errors and optimization recommendations
 * Body: { code, language }
 */
router.post("/comprehensive-analysis", getComprehensiveAnalysis);

/**
 * POST /chat
 * AI-powered chat for conversational code analysis and Q&A
 * Body: { message, code, language, analysisResults }
 */
router.post("/chat", codeChat);

/**
 * POST /assess-quality
 * ML-based code quality assessment
 * Returns quality score, grade, and recommendations
 * Body: { code, language }
 */
router.post("/assess-quality", assessQuality);

/**
 * GET /health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Code Reviewer API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
