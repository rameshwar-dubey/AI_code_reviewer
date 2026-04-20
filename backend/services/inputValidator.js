/**
 * Input Validator - Validates that input is actual code
 * Detects and warns about non-code content
 */

class InputValidator {
  /**
   * Validate if input is actual code
   * @param {string} input - User input to validate
   * @param {string} language - Programming language
   * @returns {Object} Validation result with status and warnings
   */
  static validateCodeInput(input, language = "javascript") {
    const result = {
      isValid: false,
      warnings: [],
      score: 0,
      suggestions: [],
    };

    if (!input || !input.trim()) {
      result.warnings.push(
        "ERROR: Empty input provided. Please enter code to analyze.",
      );
      return result;
    }

    const trimmedInput = input.trim();

    // Check for code-like characteristics
    let codeScore = 0;

    // Check 1: Length (code is usually more than 10 characters)
    if (trimmedInput.length < 10) {
      result.warnings.push(
        "WARNING: Input is very short. This may not be actual code.",
      );
      codeScore += 5;
    } else {
      codeScore += 20;
    }

    // Check 2: Contains code keywords
    const codeKeywords = this.getLanguageKeywords(language);
    const keywordMatch = codeKeywords.filter((kw) =>
      new RegExp(`\\b${kw}\\b`).test(trimmedInput),
    );

    if (keywordMatch.length === 0 && trimmedInput.length < 50) {
      result.warnings.push(
        `WARNING: No ${language} keywords detected. Is this valid ${language} code?`,
      );
      codeScore += 15;
    } else if (keywordMatch.length > 0) {
      codeScore += 25;
    }

    // Check 3: Contains brackets, parentheses, or braces
    const hasStructure = /[{}()\[\];:]/.test(trimmedInput);
    if (hasStructure) {
      codeScore += 20;
    } else {
      result.warnings.push(
        "WARNING: No code structure (brackets/parentheses) detected.",
      );
    }

    // Check 4: Not just English text
    const isPlainText = this.isPlainEnglishText(trimmedInput);
    if (isPlainText) {
      result.warnings.push(
        "ERROR: Input appears to be plain text, not code. Please provide actual code.",
      );
      codeScore = Math.max(codeScore - 30, 0);
    } else {
      codeScore += 15;
    }

    // Check 5: Contains assignment operators or function definitions
    const hasLogic = /[=+\-*/]|function|def|class|const|let|var|=>/.test(
      trimmedInput,
    );
    if (hasLogic) {
      codeScore += 20;
    }

    // Check 6: Sentence-like structure (common words followed by periods)
    if (this.isSentenceStructure(trimmedInput)) {
      result.warnings.push(
        "ERROR: Input looks like sentences/paragraphs, not code. Please provide code.",
      );
      codeScore = Math.max(codeScore - 40, 0);
    }

    // Check 7: Contains quotes (often used in natural language, not code)
    const quoteCount = (trimmedInput.match(/["'`]/g) || []).length;
    if (quoteCount > trimmedInput.length / 10) {
      result.warnings.push(
        "WARNING: High quote density. Ensure this is code, not natural language.",
      );
    }

    result.score = Math.min(codeScore, 100);

    // UPDATED LOGIC: Only reject if it's clearly NOT code (plain text/sentences)
    // Accept all code with ANY code-like characteristics
    const hasErrors =
      result.warnings.filter((w) => w.startsWith("ERROR")).length > 0;
    const hasCodeStructure =
      hasStructure || keywordMatch.length > 0 || hasLogic;
    const codeLength = trimmedInput.length;

    // Accept code if:
    // 1. Has structure/keywords AND no plain text error, OR
    // 2. Has any code-like structure, OR
    // 3. Score is reasonable (> 30)
    result.isValid =
      (!isPlainText && hasCodeStructure) || // Has code structure and not plain text
      (!hasErrors && codeLength > 10 && hasCodeStructure) || // Has code structure and good length
      codeScore >= 35; // Lowered threshold to 35

    // Only show suggestions if truly invalid
    if (!result.isValid) {
      result.suggestions.push(
        "✓ Paste valid code (functions, classes, logic, etc.)",
      );
      result.suggestions.push("✓ Ensure it contains code keywords and syntax");
      result.suggestions.push("✓ Avoid natural language text or descriptions");
      result.suggestions.push(`✓ Make sure it\'s valid ${language} code`);
    }

    return result;
  }

  /**
   * Get language-specific keywords
   * @param {string} language - Programming language
   * @returns {Array} Array of keywords
   */
  static getLanguageKeywords(language) {
    const keywords = {
      javascript: [
        "function",
        "const",
        "let",
        "var",
        "if",
        "else",
        "for",
        "while",
        "return",
        "class",
        "async",
        "await",
        "try",
        "catch",
        "throw",
        "new",
        "this",
        "=>",
      ],
      typescript: [
        "function",
        "const",
        "let",
        "var",
        "if",
        "else",
        "for",
        "while",
        "return",
        "class",
        "interface",
        "type",
        "enum",
        "async",
        "await",
        "try",
        "catch",
        "=>",
      ],
      python: [
        "def",
        "class",
        "if",
        "else",
        "elif",
        "for",
        "while",
        "return",
        "import",
        "try",
        "except",
        "with",
        "lambda",
        "async",
        "await",
        "yield",
        "pass",
      ],
      java: [
        "public",
        "private",
        "class",
        "static",
        "void",
        "int",
        "String",
        "if",
        "else",
        "for",
        "while",
        "return",
        "try",
        "catch",
        "throw",
        "new",
        "this",
      ],
      cpp: [
        "void",
        "int",
        "string",
        "class",
        "struct",
        "if",
        "else",
        "for",
        "while",
        "return",
        "try",
        "catch",
        "throw",
        "new",
        "template",
      ],
      cpp: [
        "void",
        "int",
        "string",
        "class",
        "struct",
        "if",
        "else",
        "for",
        "while",
        "return",
        "try",
        "catch",
        "throw",
        "new",
        "template",
      ],
      default: [
        "function",
        "class",
        "def",
        "if",
        "for",
        "while",
        "return",
        "try",
      ],
    };

    return keywords[language] || keywords.default;
  }

  /**
   * Check if input is plain English text
   * @param {string} text - Input text
   * @returns {boolean} True if input appears to be plain text
   */
  static isPlainEnglishText(text) {
    // Count words
    const words = text.split(/\s+/).filter((w) => w.length > 0);

    // Check for common English words
    const commonWords = [
      "the",
      "is",
      "at",
      "which",
      "on",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "of",
      "to",
      "for",
      "with",
      "by",
      "from",
      "are",
      "be",
      "have",
      "has",
      "do",
      "does",
      "did",
      "been",
      "being",
      "have",
      "should",
      "would",
      "could",
      "will",
      "can",
    ];

    const commonWordCount = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => commonWords.includes(word.toLowerCase())).length;

    // If more than 30% are common words and no code structure, likely plain text
    const commonWordRatio = commonWordCount / Math.max(words.length, 1);

    return commonWordRatio > 0.3 && !/[{}()\[\];:]/.test(text);
  }

  /**
   * Check if input has sentence-like structure
   * @param {string} text - Input text
   * @returns {boolean} True if input looks like sentences
   */
  static isSentenceStructure(text) {
    // Count sentences (ending with . ! ?)
    const sentenceCount = (text.match(/[.!?]\s/g) || []).length;
    const lines = text.split("\n").length;

    // If lots of sentence endings and multiple lines of text, likely sentences
    return sentenceCount > 2 && lines < 10 && text.length > 100;
  }
}

export default InputValidator;
