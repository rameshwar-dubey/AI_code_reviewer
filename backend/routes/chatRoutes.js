/**
 * Chat Routes - API endpoints for conversational AI chat
 */

import express from "express";
import chatService from "../services/chatService.js";

const router = express.Router();

/**
 * POST /chat - Send a message and get AI response
 * Body: { message, conversationId, codeAnalysis?, code?, language? }
 */
router.post("/", async (req, res) => {
  try {
    const {
      message,
      conversationId = `conv_${Date.now()}`,
      codeAnalysis = null,
      code = null,
      language = "javascript",
    } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty",
      });
    }

    const response = await chatService.generateChatResponse(
      message,
      conversationId,
      codeAnalysis,
      code,
    );

    res.json({
      success: true,
      conversationId,
      response,
    });
  } catch (error) {
    console.error("[Chat Route] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /chat/history/:conversationId - Get conversation history
 */
router.get("/history/:conversationId", (req, res) => {
  try {
    const { conversationId } = req.params;
    const history = chatService.getConversationHistory(conversationId);
    const summary = chatService.getConversationSummary(conversationId);

    res.json({
      success: true,
      conversationId,
      history,
      summary,
    });
  } catch (error) {
    console.error("[Chat Route] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /chat/clear/:conversationId - Clear conversation
 */
router.post("/clear/:conversationId", (req, res) => {
  try {
    const { conversationId } = req.params;
    chatService.clearConversation(conversationId);

    res.json({
      success: true,
      message: "Conversation cleared",
    });
  } catch (error) {
    console.error("[Chat Route] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /chat/summary/:conversationId - Get conversation summary
 */
router.get("/summary/:conversationId", (req, res) => {
  try {
    const { conversationId } = req.params;
    const summary = chatService.getConversationSummary(conversationId);

    res.json({
      success: true,
      conversationId,
      summary,
    });
  } catch (error) {
    console.error("[Chat Route] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
