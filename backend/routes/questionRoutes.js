/**
 * Questions Routes - API endpoints for question persistence
 */

import express from "express";
import {
  saveQuestion,
  getAllQuestions,
  getQuestionsByLanguage,
  searchQuestions,
  deleteQuestion,
  getStats,
} from "../controllers/questionController.js";

const router = express.Router();

/**
 * POST /questions/save
 * Save a new question
 * Body: { question, code, language, timestamp }
 */
router.post("/save", saveQuestion);

/**
 * GET /questions/all
 * Get all saved questions
 */
router.get("/all", getAllQuestions);

/**
 * GET /questions/language/:language
 * Get questions by programming language
 * Params: language (javascript, python, java, etc.)
 */
router.get("/language/:language", getQuestionsByLanguage);

/**
 * GET /questions/search
 * Search questions
 * Query: ?query=search_term
 */
router.get("/search", searchQuestions);

/**
 * DELETE /questions/:id
 * Delete a specific question
 * Params: id (question ID)
 */
router.delete("/:id", deleteQuestion);

/**
 * GET /questions/stats
 * Get statistics about saved questions
 */
router.get("/stats", getStats);

export default router;
