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
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `📡 [API] ${config.method.toUpperCase()} ${config.url}`,
      config.data,
    );
    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] Response:`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `❌ [API] Error ${error.response.status}:`,
        error.response.data,
      );
    } else if (error.request) {
      console.error(
        `❌ [API] No response - Backend may not be running:`,
        error.request,
      );
      error.message =
        "Backend server is not responding. Make sure the backend is running on port 5000.";
    } else {
      console.error(`❌ [API] Error:`, error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * Analyze code using automatic pipeline
 * Pipeline: ESLint → AST → ML Model → OpenAI
 * Includes input validation
 */
export const analyzeCode = async (code, language = "javascript") => {
  try {
    console.log(`🚀 [PIPELINE] Starting analysis for ${language}...`);
    const response = await api.post("/pipeline/analyze", { code, language });
    console.log(`✅ [PIPELINE] Analysis complete`);
    return response.data;
  } catch (error) {
    console.error("❌ [PIPELINE] Analysis error:", error);

    // Check for validation errors (400 status with validation info)
    if (error.response?.status === 400 && error.response?.data?.validation) {
      console.warn(
        "⚠️ Input validation failed:",
        error.response.data.validation,
      );
      const errorData = error.response.data;
      return {
        status: 400,
        error: errorData.error,
        validation: errorData.validation,
        data: null,
      };
    }

    // Provide helpful error messages
    if (error.message.includes("not responding")) {
      throw new Error(
        "Backend server is not running. Please start it with: npm run dev",
      );
    }

    if (error.response?.status === 404) {
      throw new Error(
        "Pipeline endpoint not found. Backend may not be updated.",
      );
    }

    // Try fallback to old endpoint
    try {
      console.log("🔄 [FALLBACK] Trying legacy endpoint...");
      const fallbackResponse = await api.post("/analyze", { code, language });
      console.log("✅ [FALLBACK] Legacy endpoint worked");
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error(
        "❌ [FALLBACK] Legacy endpoint also failed:",
        fallbackError,
      );
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
 * ============ QUESTION PERSISTENCE ============
 * Save and retrieve questions to/from database
 */

/**
 * Save a question to the database
 */
export const saveQuestion = async (question, code, language = "javascript") => {
  try {
    const response = await api.post("/questions/save", {
      question,
      code,
      language,
      timestamp: new Date().toISOString(),
    });
    console.log("✅ Question saved successfully");
    return response.data;
  } catch (error) {
    console.error("Error saving question:", error);
    // Don't throw - this shouldn't block the chat
    return null;
  }
};

/**
 * Get all questions from database
 */
export const getAllQuestions = async () => {
  try {
    const response = await api.get("/questions/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

/**
 * Get questions by language
 */
export const getQuestionsByLanguage = async (language) => {
  try {
    const response = await api.get(`/questions/language/${language}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions by language:", error);
    return [];
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
