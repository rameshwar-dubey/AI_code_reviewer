/**
 * Pipeline Controller - Handles automatic code review endpoints
 */

import {
  analyzeCodePipeline,
  chatAboutCode,
  fixCode,
} from "../services/pipelineService.js";

/**
 * POST /api/analyze
 * Automatic code review pipeline
 */
export async function analyzeCode(req, res) {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const result = await analyzeCodePipeline(code, language);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/chat
 * Chat-based code analysis
 */
export async function codeChat(req, res) {
  try {
    const { code, message, language = "javascript" } = req.body;

    if (!code || !message) {
      return res.status(400).json({ error: "Code and message are required" });
    }

    const result = await chatAboutCode(code, message, language);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/fix
 * Generate fixed/optimized code
 */
export async function fixCodeEndpoint(req, res) {
  try {
    const { code, language = "javascript", specificFix = null } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const result = await fixCode(code, language, specificFix);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Fix error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/batch-analyze
 * Analyze multiple code snippets
 */
export async function batchAnalyze(req, res) {
  try {
    const { codes, language = "javascript" } = req.body;

    if (!Array.isArray(codes)) {
      return res.status(400).json({ error: "Codes must be an array" });
    }

    const results = await Promise.all(
      codes.map((code) => analyzeCodePipeline(code, language)),
    );

    res.json({
      success: true,
      data: {
        total: results.length,
        results,
      },
    });
  } catch (error) {
    console.error("Batch analyze error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
