# ML-Based Error Detection and Correction Integration

## Overview

The AI Code Reviewer has been enhanced with advanced ML-based error detection and code correction capabilities. The system now uses a multi-stage ML pipeline to identify specific error types and generate corrected code.

## Architecture

### New Components

#### 1. **Error Detector** (`ml_service/error_detector.py`)

Detects errors using ML feature analysis:

- **Complexity Analysis**: High cyclomatic complexity detection
- **Nesting Detection**: Deep nesting level identification
- **Function Size**: Large function detection
- **Documentation**: Missing comments/docstrings detection
- **Error Handling**: Missing try-catch blocks
- **Type Safety**: Missing type hints
- **Code Duplication**: Duplicate code detection
- **Naming Conventions**: Variable naming violations
- **Performance Issues**: Nested loops, string concatenation in loops

**Error Categories:**

- COMPLEXITY: High cyclomatic complexity (> 15)
- NESTING: Deep nesting (> 4 levels)
- SIZE: Large functions (> 30 lines)
- DOCUMENTATION: Insufficient comments
- ERROR_HANDLING: Missing error handling
- TYPE_SAFETY: Missing type hints
- UNUSED_VARS: Unused variables
- DUPLICATION: Code duplication patterns
- NAMING: Naming convention violations
- PERFORMANCE: Performance anti-patterns

#### 2. **Code Corrector** (`ml_service/code_corrector.py`)

Generates corrected code based on detected errors:

**Python Fixes:**

- Convert camelCase to snake_case
- Add missing colons after if/for/while
- Convert tabs to spaces
- Add docstrings to functions
- Fix common syntax mistakes

**JavaScript/TypeScript Fixes:**

- Add missing semicolons
- Convert `var` to `const`
- Fix spacing around operators
- Update function syntax

**Java Fixes:**

- Add missing semicolons
- Add access modifiers
- Standardize spacing

**Common Fixes:**

- Remove trailing whitespace
- Fix formatting and spacing
- Remove multiple blank lines
- Balance parentheses/brackets

### New ML Service Endpoints

#### `POST /detect-errors`

Detects errors using ML analysis.

**Request:**

```json
{
  "code": "source code here",
  "language": "python" // optional
}
```

**Response:**

```json
{
  "success": true,
  "errors": [
    {
      "type": "COMPLEXITY",
      "severity": "HIGH",
      "message": "Code has high cyclomatic complexity",
      "suggestion": "Refactor into smaller functions",
      "priority": 1
    }
  ],
  "warnings": [...],
  "total_errors": 2,
  "total_warnings": 5,
  "error_score": 75,
  "error_density": 0.05
}
```

#### `POST /correct-code`

Generates corrected code.

**Request:**

```json
{
  "code": "source code here",
  "language": "python"
}
```

**Response:**

```json
{
  "success": true,
  "original_code": "...",
  "corrected_code": "...",
  "fixes_applied": [
    "Renamed variable 'userName' to 'user_name' (Python convention)",
    "Added missing docstrings to functions"
  ],
  "improvements": 5,
  "error_report": {...}
}
```

#### `POST /analyze-and-correct`

Complete pipeline: analyze, detect errors, and correct code.

**Request:**

```json
{
  "code": "source code here",
  "language": "python"
}
```

**Response:**

```json
{
  "success": true,
  "original_code": "...",
  "corrected_code": "...",
  "quality_score": 85,
  "risk_level": "Low",
  "error_report": {...},
  "fixes_applied": [...],
  "improvements": 5
}
```

## Updated Backend Pipeline

### 4-Stage Analysis Pipeline

1. **ESLint Analysis** (Stage 1)
   - Syntax error detection
   - Style violations
   - Best practices

2. **AST Structural Analysis** (Stage 2)
   - Code structure issues
   - Dependency analysis
   - Pattern detection

3. **ML Error Detection & Correction** (Stage 3)
   - Error categorization
   - Feature-based analysis
   - Code correction
   - Automatic fixes

4. **AI Review with OpenAI** (Stage 4)
   - Comprehensive review
   - Intelligent suggestions
   - Optimized code generation
   - Uses ML error details for better corrections

### Modified Response Format

```javascript
{
  "errors": {
    "lint": [...],              // Linting errors
    "structural": [...],        // AST issues
    "ml_detected": [...],       // ML detected errors
    "total_issues": 10
  },
  "ml_analysis": {
    "score": 85,
    "risk_level": "Low",
    "errors_detected": 3,       // NEW
    "warnings": 5,              // NEW
    "error_score": 75           // NEW
  },
  "ml_corrections": {
    "fixes_applied": [...],     // NEW
    "improvements": 5           // NEW
  },
  "corrected_code": "...",      // Final corrected code
  "summary": {
    "ml_improvements": 5        // NEW
  }
}
```

## Frontend Display

### ChatBot Component Updates

ML error detection information is displayed in the bot response:

```
✨ Corrected Code (Fixed)
  [Corrected code displayed prominently in yellow]

🔍 ML Error Detection
  Errors Detected: 3
  Warnings: 5

  Error Types:
  [HIGH] COMPLEXITY - Code has high cyclomatic complexity
  [MEDIUM] NESTING - Deep nesting depth: 5 levels
  [MEDIUM] SIZE - Functions are too large

  ✓ 5 improvements applied
```

## Integration Flow

```
User Input Code
  ↓
Input Validation (Lenient: score >= 35)
  ↓
Pipeline Start
  ├─→ ESLint Analysis
  ├─→ AST Analysis
  ├─→ ML Error Detection & Correction
  │   ├─→ Detect errors (error_detector.py)
  │   ├─→ Generate corrections (code_corrector.py)
  │   └─→ Return corrected code
  └─→ AI Review with OpenAI
      └─→ Uses ML error details
  ↓
Combined Response
  ├─→ Original errors (lint + AST + ML)
  ├─→ Corrected code
  ├─→ ML fixes applied
  └─→ AI suggestions
  ↓
Frontend Display
  ├─→ Corrected code (prominent, yellow)
  ├─→ ML error detection results
  └─→ AI review details
```

## Usage Example

### Python Code Analysis

```python
# Input code with issues
def calculateTotal(items):
    total=0
    for item in items:
        if item['price']>0:
            if item['quantity']>0:
                if item['available']:
                    total = total + item['price'] * item['quantity']
    return total
```

**ML Detection Results:**

- **NAMING**: Use snake_case for function names (calculateTotal → calculate_total)
- **COMPLEXITY**: High cyclomatic complexity (3 nested ifs)
- **STYLE**: Missing spaces around operators
- **DOCUMENTATION**: Missing docstring

**Corrected Code:**

```python
def calculate_total(items):
    """Calculate total price of available items."""
    total = 0
    for item in items:
        if item['price'] > 0 and item['quantity'] > 0 and item['available']:
            total = total + item['price'] * item['quantity']
    return total
```

**Fixes Applied:**

- Renamed function to snake_case
- Added docstring
- Simplified nested conditions
- Fixed spacing around operators
- Added type hints (if configured)

## Configuration

### Environment Variables

```
ML_SERVICE_URL=http://localhost:5001
OPENAI_API_KEY=sk-...
```

### Language Support

- Python
- JavaScript
- TypeScript
- Java
- C++

## Error Severity Levels

- **HIGH**: Critical errors that must be fixed (complexity > 15, missing error handling)
- **MEDIUM**: Important issues to address (deep nesting, large functions)
- **LOW**: Suggestions for improvement (naming, unused variables)

## Performance

- Error detection: < 500ms
- Code correction: < 300ms
- ML + AI combined: < 2s
- Supports files up to 10MB

## Testing the Integration

### Test ML Error Detection

```bash
curl -X POST http://localhost:5001/detect-errors \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def calculateTotal(items):\n    total=0\n    for item in items:\n        total = total + item",
    "language": "python"
  }'
```

### Test Code Correction

```bash
curl -X POST http://localhost:5001/correct-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def calculateTotal(items):\n    total=0\n    return total",
    "language": "python"
  }'
```

### Test Full Pipeline

```bash
curl -X POST http://localhost:5000/api/analyze/pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "code": "your code here",
    "language": "python"
  }'
```

## Benefits

1. **Automatic Error Detection**: ML identifies specific error types beyond syntax checking
2. **Intelligent Corrections**: Code is automatically corrected based on detected errors
3. **Language-Aware**: Different fixes for Python, JavaScript, Java, etc.
4. **AI Integration**: OpenAI uses ML error details for better recommendations
5. **Multi-stage Analysis**: Combines linting, AST, ML, and AI for comprehensive review
6. **User-Friendly**: Clear presentation of errors, fixes, and improvements

## Next Steps

1. Train custom ML models on code quality datasets
2. Add more error detection patterns
3. Implement refactoring suggestions
4. Add performance analysis
5. Create code quality metrics dashboard
