"""
Input Validator - Validates that input is actual code (Python version)
Detects and warns about non-code content
"""

import re


class CodeInputValidator:
    """Validates code input for ML model"""

    @staticmethod
    def validate_code_input(code: str, language: str = "python") -> dict:
        """
        Validate if input is actual code
        
        Args:
            code: User input to validate
            language: Programming language
            
        Returns:
            Dictionary with validation status and warnings
        """
        result = {
            "is_valid": False,
            "warnings": [],
            "score": 0,
            "suggestions": [],
        }

        if not code or not code.strip():
            result["warnings"].append("ERROR: Empty input provided. Please enter code to analyze.")
            return result

        trimmed_code = code.strip()

        # Check for code-like characteristics
        code_score = 0

        # Check 1: Length (code is usually more than 10 characters)
        if len(trimmed_code) < 10:
            result["warnings"].append("WARNING: Input is very short. This may not be actual code.")
            code_score += 5
        else:
            code_score += 20

        # Check 2: Contains code keywords
        code_keywords = CodeInputValidator.get_language_keywords(language)
        keyword_matches = [kw for kw in code_keywords if re.search(r'\b' + kw + r'\b', trimmed_code)]

        if len(keyword_matches) == 0 and len(trimmed_code) < 50:
            result["warnings"].append(f"WARNING: No {language} keywords detected. Is this valid {language} code?")
            code_score += 15
        elif len(keyword_matches) > 0:
            code_score += 25

        # Check 3: Contains brackets, parentheses, or braces
        has_structure = bool(re.search(r'[{}()\[\];:]', trimmed_code))
        if has_structure:
            code_score += 20
        else:
            result["warnings"].append("WARNING: No code structure (brackets/parentheses) detected.")

        # Check 4: Not just English text
        is_plain_text = CodeInputValidator.is_plain_english_text(trimmed_code)
        if is_plain_text:
            result["warnings"].append("ERROR: Input appears to be plain text, not code. Please provide actual code.")
            code_score = max(code_score - 30, 0)
        else:
            code_score += 15

        # Check 5: Contains assignment operators or function definitions
        has_logic = bool(re.search(r'[=+\-*/]|def|class|import|return|lambda', trimmed_code))
        if has_logic:
            code_score += 20

        # Check 6: Sentence-like structure
        if CodeInputValidator.is_sentence_structure(trimmed_code):
            result["warnings"].append("ERROR: Input looks like sentences/paragraphs, not code. Please provide code.")
            code_score = max(code_score - 40, 0)

        # Check 7: Contains quotes
        quote_count = len(re.findall(r'["\']', trimmed_code))
        if len(trimmed_code) > 0 and quote_count > len(trimmed_code) / 10:
            result["warnings"].append("WARNING: High quote density. Ensure this is code, not natural language.")

        result["score"] = min(code_score, 100)
        
        # UPDATED LOGIC: Only reject if clearly NOT code (plain text/sentences)
        # Accept all code with ANY code-like characteristics
        error_warnings = [w for w in result["warnings"] if w.startswith("ERROR")]
        has_code_structure = has_structure or len(keyword_matches) > 0 or has_logic
        code_length = len(trimmed_code)
        
        # Accept code if:
        # 1. Has structure/keywords AND no plain text error, OR
        # 2. Has any code-like structure, OR
        # 3. Score is reasonable (> 30)
        result["is_valid"] = (
            (not is_plain_text and has_code_structure) or  # Has code structure and not plain text
            (len(error_warnings) == 0 and code_length > 10 and has_code_structure) or  # Good length + structure
            (code_score >= 35)  # Lowered threshold to 35
        )

        if not result["is_valid"]:
            result["suggestions"].append("✓ Paste valid code (functions, classes, logic, etc.)")
            result["suggestions"].append("✓ Ensure it contains code keywords and syntax")
            result["suggestions"].append("✓ Avoid natural language text or descriptions")
            result["suggestions"].append(f"✓ Make sure it's valid {language} code")

        return result

    @staticmethod
    def get_language_keywords(language: str) -> list:
        """
        Get language-specific keywords
        
        Args:
            language: Programming language
            
        Returns:
            List of keywords
        """
        keywords = {
            "python": [
                "def", "class", "if", "else", "elif", "for", "while", "return",
                "import", "from", "try", "except", "with", "lambda", "async", "await",
                "yield", "pass", "break", "continue", "assert"
            ],
            "javascript": [
                "function", "const", "let", "var", "if", "else", "for", "while",
                "return", "class", "async", "await", "try", "catch", "throw", "new", "this"
            ],
            "java": [
                "public", "private", "class", "static", "void", "int", "String",
                "if", "else", "for", "while", "return", "try", "catch", "throw", "new"
            ],
            "cpp": [
                "void", "int", "string", "class", "struct", "if", "else", "for",
                "while", "return", "try", "catch", "throw", "new", "template"
            ],
        }

        return keywords.get(language, keywords["python"])

    @staticmethod
    def is_plain_english_text(text: str) -> bool:
        """
        Check if input is plain English text
        
        Args:
            text: Input text
            
        Returns:
            True if input appears to be plain text
        """
        words = text.split()
        
        common_words = [
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "of",
            "to", "for", "with", "by", "from", "are", "be", "have", "has", "do", "does",
            "did", "been", "being", "should", "would", "could", "will", "can", "that", "this"
        ]

        common_word_count = sum(
            1 for word in words if word.lower() in common_words
        )
        common_word_ratio = common_word_count / max(len(words), 1)

        has_code_structure = bool(re.search(r'[{}()\[\];:]', text))
        
        return common_word_ratio > 0.3 and not has_code_structure

    @staticmethod
    def is_sentence_structure(text: str) -> bool:
        """
        Check if input has sentence-like structure
        
        Args:
            text: Input text
            
        Returns:
            True if input looks like sentences
        """
        sentence_count = len(re.findall(r'[.!?]\s', text))
        lines = len(text.split('\n'))

        return sentence_count > 2 and lines < 10 and len(text) > 100
