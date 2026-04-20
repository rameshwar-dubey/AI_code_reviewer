/**
 * API Service - Handles all backend communication
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Analyze code using automatic pipeline
 * Pipeline: ESLint → AST → ML Model → OpenAI
 */
export const analyzeCode = async (code, language = "javascript") => {
  try {
    const response = await api.post("/pipeline/analyze", { code, language });
    return response.data;
  } catch (error) {
    console.error("Pipeline analysis error:", error);
    // Fallback to old endpoint if pipeline not available
    try {
      const fallbackResponse = await api.post("/analyze", { code, language });
      return fallbackResponse.data;
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

/**
 * Get AI-powered code review
 */
export const reviewCode = async (
  code,
  language = "javascript",
  issues = [],
) => {
  try {
    const response = await api.post("/review", { code, language, issues });
    return response.data;
  } catch (error) {
    console.error("Review error:", error);
    throw error;
  }
};

/**
 * Get fixed code
 */
export const fixCode = async (code, language = "javascript", issues = []) => {
  try {
    const response = await api.post("/fix", { code, language, issues });
    return response.data;
  } catch (error) {
    console.error("Fix error:", error);
    throw error;
  }
};

/**
 * Analyze GitHub repository
 */
export const analyzeRepository = async (repoUrl) => {
  try {
    const response = await api.post("/analyze-repo", { repoUrl });
    return response.data;
  } catch (error) {
    console.error("Repository analysis error:", error);
    throw error;
  }
};

/**
 * Analyze security vulnerabilities
 */
export const analyzeSecurityIssues = async (code, language = "javascript") => {
  try {
    const response = await api.post("/security", { code, language });
    return response.data;
  } catch (error) {
    console.error("Security analysis error:", error);
    throw error;
  }
};

/**
 * Deep AI analysis with ML-based pattern detection
 * Returns comprehensive code quality metrics and analysis
 */
export const deepAnalyzeCode = async (code, language = "javascript") => {
  try {
    const response = await api.post("/deep-analyze", { code, language });
    return response.data;
  } catch (error) {
    console.error("Deep analysis error:", error);
    throw error;
  }
};

/**
 * Get comprehensive analysis with errors and optimization solutions
 * Returns categorized errors and optimization recommendations
 */
export const getComprehensiveAnalysis = async (
  code,
  language = "javascript",
) => {
  try {
    const response = await api.post("/comprehensive-analysis", {
      code,
      language,
    });
    return response.data;
  } catch (error) {
    console.error("Comprehensive analysis error:", error);
    throw error;
  }
};

/**
 * Chat with AI about code
 * Conversational analysis and Q&A about code
 */
export const chatWithAI = async (
  message,
  code,
  language = "javascript",
  analysisResults = null,
) => {
  try {
    const response = await api.post("/chat", {
      message,
      code,
      language,
      analysisResults,
    });
    return response.data;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

/**
 * Assess code quality
 * ML-based quality score, grade, and recommendations
 */
export const assessCodeQuality = async (code, language = "javascript") => {
  try {
    const response = await api.post("/assess-quality", { code, language });
    return response.data;
  } catch (error) {
    console.error("Quality assessment error:", error);
    throw error;
  }
};

/**
 * ============ PIPELINE FUNCTIONS ============
 * These functions use the new automatic pipeline endpoints
 */

/**
 * Chat with code using pipeline
 * Message-based conversational analysis
 */
export const pipelineChatWithCode = async (
  code,
  message,
  language = "javascript",
) => {
  try {
    const response = await api.post("/pipeline/chat", {
      code,
      message,
      language,
    });
    return response.data;
  } catch (error) {
    console.error("Pipeline chat error:", error);
    throw error;
  }
};

/**
 * Fix and optimize code using pipeline
 * Generates improved version of code
 */
export const pipelineFixCode = async (
  code,
  language = "javascript",
  specificFix = null,
) => {
  try {
    const response = await api.post("/pipeline/fix", {
      code,
      language,
      specificFix,
    });
    return response.data;
  } catch (error) {
    console.error("Pipeline fix error:", error);
    throw error;
  }
};

/**
 * Batch analyze multiple code snippets
 */
export const pipelineBatchAnalyze = async (codes, language = "javascript") => {
  try {
    const response = await api.post("/pipeline/batch-analyze", {
      codes,
      language,
    });
    return response.data;
  } catch (error) {
    console.error("Pipeline batch analyze error:", error);
    throw error;
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};

export default api;
