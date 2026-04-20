/**
 * Chat Service - Conversational AI for Code Review
 * Handles intelligent conversations about code analysis
 */

/**
 * AI Chat Service - Provides intelligent responses based on code analysis
 */
class ChatService {
  constructor() {
    this.conversationHistory = new Map(); // Store conversation context
    this.codeContext = new Map(); // Store analyzed code for reference
  }

  /**
   * Generate AI response based on code analysis and user question
   */
  async generateChatResponse(
    userMessage,
    conversationId,
    codeAnalysis = null,
    code = null,
  ) {
    try {
      // Store code context if provided
      if (code && codeAnalysis) {
        this.codeContext.set(conversationId, {
          code,
          analysis: codeAnalysis,
          timestamp: new Date(),
        });
      }

      // Get conversation history
      const history = this.conversationHistory.get(conversationId) || [];

      // Process user message
      const response = await this.processMessage(
        userMessage,
        history,
        codeAnalysis,
      );

      // Update conversation history
      history.push({
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      });
      history.push({
        role: "assistant",
        content: response.message,
        metadata: response.metadata,
        timestamp: new Date(),
      });

      this.conversationHistory.set(conversationId, history);

      return {
        success: true,
        message: response.message,
        suggestions: response.suggestions,
        nextActions: response.nextActions,
        metadata: response.metadata,
      };
    } catch (error) {
      console.error("[Chat] Error generating response:", error);
      return {
        success: false,
        message: "Sorry, I encountered an error. Please try again.",
        error: error.message,
      };
    }
  }

  /**
   * Process user message and generate contextual response
   */
  async processMessage(userMessage, history, codeAnalysis) {
    const lowerMessage = userMessage.toLowerCase();
    let response = {
      message: "",
      suggestions: [],
      nextActions: [],
      metadata: {},
    };

    // Check message intent
    if (this.isAskingAboutErrors(lowerMessage)) {
      response = this.handleErrorQuestion(userMessage, codeAnalysis);
    } else if (this.isAskingForFixes(lowerMessage)) {
      response = this.handleFixQuestion(userMessage, codeAnalysis);
    } else if (this.isAskingAboutBestPractices(lowerMessage)) {
      response = this.handleBestPracticesQuestion(userMessage, codeAnalysis);
    } else if (this.isAskingForExplanation(lowerMessage)) {
      response = this.handleExplanationQuestion(userMessage, codeAnalysis);
    } else if (this.isAskingForImprovement(lowerMessage)) {
      response = this.handleImprovementQuestion(userMessage, codeAnalysis);
    } else {
      response = this.handleGeneralQuestion(userMessage, codeAnalysis);
    }

    return response;
  }

  /**
   * Detect if user is asking about errors
   */
  isAskingAboutErrors(message) {
    const keywords = [
      "error",
      "bug",
      "mistake",
      "wrong",
      "issue",
      "problem",
      "fail",
      "crash",
    ];
    return keywords.some((kw) => message.includes(kw));
  }

  /**
   * Handle questions about errors
   */
  handleErrorQuestion(userMessage, codeAnalysis) {
    let message = "Great question! Let me analyze the errors in your code:\n\n";
    let suggestions = [];

    if (codeAnalysis && codeAnalysis.errors && codeAnalysis.errors.length > 0) {
      const errors = codeAnalysis.errors;

      // Group errors by type
      const errorsByType = {};
      errors.forEach((error) => {
        if (!errorsByType[error.type]) {
          errorsByType[error.type] = [];
        }
        errorsByType[error.type].push(error);
      });

      // Generate detailed explanation
      Object.entries(errorsByType).forEach(([type, typeErrors]) => {
        message += `**${type}** (${typeErrors.length} found)\n`;
        typeErrors.slice(0, 3).forEach((error, idx) => {
          message += `${idx + 1}. ${error.message}\n`;
          suggestions.push({
            type,
            message: error.message,
            suggestion: error.suggestion,
          });
        });
        message += "\n";
      });

      message += `\n📊 **Error Score**: ${codeAnalysis.error_score || 0}/100\n`;
      message += "Would you like me to explain how to fix any of these errors?";
    } else {
      message = "✅ Good news! No critical errors found in your code.";
    }

    return {
      message,
      suggestions,
      nextActions: ["Show me how to fix these", "Explain best practices"],
      metadata: { type: "error_analysis" },
    };
  }

  /**
   * Detect if user is asking for fixes
   */
  isAskingForFixes(message) {
    const keywords = ["fix", "correct", "improve", "solve", "help", "how"];
    return keywords.some((kw) => message.includes(kw));
  }

  /**
   * Handle fix/improvement questions
   */
  handleFixQuestion(userMessage, codeAnalysis) {
    let message = "Here's how we can improve your code:\n\n";
    let suggestions = [];

    if (
      codeAnalysis &&
      codeAnalysis.fixes_applied &&
      codeAnalysis.fixes_applied.length > 0
    ) {
      codeAnalysis.fixes_applied.forEach((fix, idx) => {
        message += `**${idx + 1}. ${fix}**\n`;
        suggestions.push(fix);
      });

      message += `\n✨ **Total Improvements**: ${codeAnalysis.improvements || 0}\n`;
      message +=
        "\n🔍 Key improvements made:\n" +
        "• Better naming conventions\n" +
        "• Improved formatting\n" +
        "• Enhanced readability\n" +
        "• Added documentation\n";

      message +=
        "\nWould you like the corrected code or more details on any fix?";
    } else {
      message =
        "Your code is already well-structured! 🎉\n\n" +
        "Would you like suggestions for further optimization?";
    }

    return {
      message,
      suggestions,
      nextActions: [
        "Show me the corrected code",
        "Explain each fix",
        "More optimizations",
      ],
      metadata: { type: "fix_suggestions" },
    };
  }

  /**
   * Detect if user is asking about best practices
   */
  isAskingAboutBestPractices(message) {
    const keywords = [
      "best practice",
      "standard",
      "convention",
      "should",
      "recommend",
      "good",
      "pattern",
    ];
    return keywords.some((kw) => message.includes(kw));
  }

  /**
   * Handle best practices questions
   */
  handleBestPracticesQuestion(userMessage, codeAnalysis) {
    const language = codeAnalysis?.language || "your language";
    const practices = this.getBestPractices(language);

    let message = `📚 Best Practices for **${language}**:\n\n`;

    practices.forEach((practice, idx) => {
      message += `${idx + 1}. **${practice.title}**\n   ${practice.description}\n\n`;
    });

    message +=
      "💡 **Tip**: Apply these practices consistently across all your projects!";

    return {
      message,
      suggestions: practices,
      nextActions: [
        "Show me examples",
        "Check my code against these",
        "Learn more",
      ],
      metadata: { type: "best_practices" },
    };
  }

  /**
   * Get best practices for a language
   */
  getBestPractices(language) {
    const practices = {
      javascript: [
        {
          title: "Use const/let instead of var",
          description:
            "var has function scope which can lead to unexpected behavior",
        },
        {
          title: "Add error handling",
          description:
            "Always use try-catch blocks for operations that might fail",
        },
        {
          title: "Use descriptive names",
          description:
            "Variable and function names should clearly indicate their purpose",
        },
        {
          title: "Add semicolons",
          description:
            "While not always required, semicolons prevent insertion issues",
        },
      ],
      python: [
        {
          title: "Use snake_case for variables",
          description:
            "Python convention is lowercase with underscores, not camelCase",
        },
        {
          title: "Add docstrings",
          description:
            "Document your functions and classes with proper docstrings",
        },
        {
          title: "Add type hints",
          description:
            "Modern Python uses type hints for clarity and IDE support",
        },
        {
          title: "Reduce nesting",
          description:
            "Deep nesting reduces readability - extract methods instead",
        },
      ],
      java: [
        {
          title: "Use meaningful class names",
          description: "Class names should be PascalCase and descriptive",
        },
        {
          title: "Add JavaDoc comments",
          description: "Document public methods and classes with JavaDoc",
        },
        {
          title: "Handle exceptions properly",
          description:
            "Use specific exception types and handle them appropriately",
        },
        {
          title: "Follow DRY principle",
          description: "Avoid code duplication - extract common logic",
        },
      ],
    };

    return practices[language.toLowerCase()] || practices.javascript || [];
  }

  /**
   * Detect if user is asking for explanation
   */
  isAskingForExplanation(message) {
    const keywords = [
      "what",
      "why",
      "explain",
      "understand",
      "clarify",
      "mean",
      "how it works",
    ];
    return keywords.some((kw) => message.includes(kw));
  }

  /**
   * Handle explanation questions
   */
  handleExplanationQuestion(userMessage, codeAnalysis) {
    let message = "Let me explain what's happening with your code:\n\n";

    if (codeAnalysis) {
      message +=
        `**Code Quality Score**: ${codeAnalysis.error_score || 0}/100\n\n` +
        "**What this means:**\n" +
        "- Scores 80+ indicate high-quality, maintainable code\n" +
        "- Scores 60-80 suggest some improvements needed\n" +
        "- Scores below 60 indicate significant refactoring opportunities\n\n";

      if (codeAnalysis.errors && codeAnalysis.errors.length > 0) {
        message += "**Current Issues:**\n";
        codeAnalysis.errors.slice(0, 3).forEach((error) => {
          message += `• ${error.type}: ${error.message}\n`;
        });
      }

      message +=
        "\n💡 **Next Steps**: I can help you fix these issues step by step!";
    }

    return {
      message,
      suggestions: [],
      nextActions: [
        "Show me fixes",
        "Explain errors in detail",
        "Compare with best practices",
      ],
      metadata: { type: "explanation" },
    };
  }

  /**
   * Detect if user is asking for improvement
   */
  isAskingForImprovement(message) {
    const keywords = [
      "improve",
      "optimize",
      "performance",
      "speed",
      "efficient",
      "better",
      "upgrade",
    ];
    return keywords.some((kw) => message.includes(kw));
  }

  /**
   * Handle improvement questions
   */
  handleImprovementQuestion(userMessage, codeAnalysis) {
    let message = "🚀 Here are optimization suggestions for your code:\n\n";
    let suggestions = [];

    const improvements = [
      "Use async/await for asynchronous operations",
      "Reduce function complexity with helper methods",
      "Add caching for repeated calculations",
      "Optimize loops and conditionals",
      "Add error handling and validation",
      "Use design patterns appropriately",
    ];

    improvements.slice(0, 5).forEach((imp, idx) => {
      message += `${idx + 1}. **${imp}**\n`;
      suggestions.push(imp);
    });

    message += "\n📊 Apply these improvements for:\n";
    message +=
      "✓ Better performance\n✓ Improved maintainability\n✓ Enhanced readability\n";

    return {
      message,
      suggestions,
      nextActions: ["Show examples", "Check performance", "Learn more"],
      metadata: { type: "optimization" },
    };
  }

  /**
   * Handle general questions
   */
  handleGeneralQuestion(userMessage, codeAnalysis) {
    const message =
      "I'm here to help with code review! 👋\n\n" +
      "You can ask me about:\n" +
      "• **Errors** - What errors are in the code?\n" +
      "• **Fixes** - How can I improve this?\n" +
      "• **Best Practices** - What should I follow?\n" +
      "• **Explanations** - Why is this recommended?\n" +
      "• **Optimization** - How to make it faster?\n\n" +
      "What would you like to know?";

    return {
      message,
      suggestions: [],
      nextActions: [
        "Analyze my code",
        "Show best practices",
        "Get suggestions",
      ],
      metadata: { type: "general_help" },
    };
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId) {
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Clear conversation
   */
  clearConversation(conversationId) {
    this.conversationHistory.delete(conversationId);
    this.codeContext.delete(conversationId);
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(conversationId) {
    const history = this.getConversationHistory(conversationId);
    const context = this.codeContext.get(conversationId);

    return {
      messageCount: history.length,
      hasCodeContext: !!context,
      lastMessage: history.length > 0 ? history[history.length - 1] : null,
      codeAnalysis: context?.analysis || null,
    };
  }
}

export default new ChatService();
