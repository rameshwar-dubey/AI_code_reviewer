/**
 * Questions Controller - Handles question persistence
 * Stores and retrieves questions from database
 */

// In-memory storage (can be replaced with real database like MongoDB)
let questionsDB = [];

/**
 * Save a question to the database
 */
export const saveQuestion = async (req, res) => {
  try {
    const { question, code, language, timestamp } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const questionRecord = {
      id: Date.now(),
      question,
      code: code || "",
      language: language || "javascript",
      timestamp: timestamp || new Date().toISOString(),
      savedAt: new Date().toISOString(),
    };

    questionsDB.push(questionRecord);
    console.log(`✅ Question saved: "${question}"`);

    res.json({
      success: true,
      message: "Question saved successfully",
      id: questionRecord.id,
    });
  } catch (error) {
    console.error("Error saving question:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all questions from database
 */
export const getAllQuestions = async (req, res) => {
  try {
    console.log(`📊 Retrieving all questions. Total: ${questionsDB.length}`);

    // Return sorted by newest first
    const sortedQuestions = [...questionsDB].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );

    res.json({
      success: true,
      total: sortedQuestions.length,
      questions: sortedQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get questions by language
 */
export const getQuestionsByLanguage = async (req, res) => {
  try {
    const { language } = req.params;

    if (!language) {
      return res.status(400).json({ error: "Language is required" });
    }

    const filtered = questionsDB.filter((q) => q.language === language);
    console.log(
      `📊 Questions for ${language}: ${filtered.length}/${questionsDB.length}`,
    );

    res.json({
      success: true,
      language,
      total: filtered.length,
      questions: filtered,
    });
  } catch (error) {
    console.error("Error fetching questions by language:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search questions
 */
export const searchQuestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = questionsDB.filter(
      (q) =>
        q.question.toLowerCase().includes(query.toLowerCase()) ||
        q.language.toLowerCase().includes(query.toLowerCase()),
    );

    console.log(`🔍 Search results for "${query}": ${results.length} found`);

    res.json({
      success: true,
      query,
      total: results.length,
      questions: results,
    });
  } catch (error) {
    console.error("Error searching questions:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a question
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Question ID is required" });
    }

    const initialLength = questionsDB.length;
    questionsDB = questionsDB.filter((q) => q.id !== parseInt(id));

    if (questionsDB.length === initialLength) {
      return res.status(404).json({ error: "Question not found" });
    }

    console.log(`🗑️ Question deleted: ${id}`);

    res.json({
      success: true,
      message: "Question deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get question statistics
 */
export const getStats = async (req, res) => {
  try {
    const stats = {
      totalQuestions: questionsDB.length,
      byLanguage: {},
      recentQuestions: questionsDB.slice(-5).reverse(),
    };

    // Group by language
    questionsDB.forEach((q) => {
      if (!stats.byLanguage[q.language]) {
        stats.byLanguage[q.language] = 0;
      }
      stats.byLanguage[q.language]++;
    });

    console.log(`📈 Stats: ${stats.totalQuestions} total questions`);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
};
