# Input Validation - Quick Reference Guide

## Quick Start

### For Users

1. Paste **actual code** into the editor
2. If validation fails, you'll see clear warnings
3. Follow the suggestions to fix your input
4. Try again with valid code

### For Developers

#### Validate Code (Backend)

```javascript
import InputValidator from "../services/inputValidator.js";

// Validate input
const validation = InputValidator.validateCodeInput(code, "javascript");

if (!validation.isValid) {
  console.log("Warnings:", validation.warnings);
  console.log("Score:", validation.score);
  console.log("Suggestions:", validation.suggestions);
}
```

#### Validate Code (Python)

```python
from input_validator import CodeInputValidator

# Validate input
validation = CodeInputValidator.validate_code_input(code, "python")

if not validation["is_valid"]:
    print("Warnings:", validation["warnings"])
    print("Score:", validation["score"])
    print("Suggestions:", validation["suggestions"])
```

---

## Validation Object Structure

```javascript
{
  isValid: boolean,              // True if code passes validation
  warnings: string[],            // List of warning/error messages
  score: number,                 // 0-100 code quality score
  suggestions: string[]          // How to fix the input
}
```

Example:

```javascript
{
  isValid: false,
  warnings: [
    "ERROR: Input appears to be plain text, not code.",
    "WARNING: No JavaScript keywords detected."
  ],
  score: 25,
  suggestions: [
    "✓ Paste valid code (functions, classes, logic, etc.)",
    "✓ Ensure it contains code keywords and syntax",
    "✓ Avoid natural language text or descriptions",
    "✓ Make sure it's valid javascript code"
  ]
}
```

---

## Return Codes

### ✅ Valid Code

```
Status: 200 OK
Action: Continue with analysis
Response: Analysis results
```

### ❌ Invalid Code

```
Status: 400 Bad Request
Action: Stop analysis, show validation warnings
Response:
{
  error: "Invalid input: Please provide actual code, not text",
  validation: { ... },
  code: null
}
```

---

## Validation Methods

### Method 1: Frontend Check (Real-time)

```javascript
// Automatic as user types
// Visual feedback: highlighting, warnings
// No API calls
```

### Method 2: Backend Check (Before Analysis)

```javascript
// HTTP 400 if invalid
// Validation details included
// Stops analysis pipeline
```

### Method 3: ML Service Check (Double Validation)

```python
# Python-side validation
# Validation info in response
# Defensive programming
```

---

## Error Categories

### ERROR - Blocks Analysis ❌

- Empty input
- Plain text detected
- Sentence structure detected

### WARNING - Allows Analysis ⚠️

- Very short code
- No keywords found
- No structure detected
- High quote density

---

## Keywords by Language

### JavaScript

```javascript
function, const, let, var, if, else, for, while,
return, class, async, await, try, catch, throw, new
```

### Python

```python
def, class, if, else, elif, for, while, return,
import, from, try, except, with, lambda, async
```

### Java

```java
public, private, class, static, void, int, String,
if, else, for, while, return, try, catch, throw
```

### C++

```cpp
void, int, string, class, struct, if, else,
for, while, return, try, catch, throw, template
```

---

## Score Thresholds

| Score Range | Status       | Action          |
| ----------- | ------------ | --------------- |
| 0-20        | Invalid      | ❌ Reject       |
| 20-50       | Questionable | ⚠️ Warn + Allow |
| 50-80       | Valid        | ✅ Allow        |
| 80-100      | Excellent    | ✅ Allow        |

---

## Common Patterns

### ✅ PASS: Actual Code

```javascript
function sum(a, b) {
  return a + b;
}
```

### ❌ FAIL: Plain Text

```
To add two numbers in JavaScript, create a function that
takes two parameters and returns their sum using addition.
```

### ⚠️ WARN: Minimal Code

```javascript
x = 5;
```

### ✅ PASS: Code with Comments

```javascript
// Add two numbers
function add(a, b) {
  return a + b;
}
```

---

## Integration Checklist

- [x] Backend validation added to analyzeController
- [x] Frontend handles 400 errors gracefully
- [x] Error messages are user-friendly
- [x] Suggestions are actionable
- [x] ML service validates input
- [x] All language keywords configured
- [x] Documentation complete

---

## Debugging

### Enable Verbose Logging

```javascript
// In browser console
localStorage.setItem("debug:validation", "true");

// Backend logs show validation details
```

### Check Validation Score

```javascript
// Get validation result
const validation = InputValidator.validateCodeInput(code, lang);
console.log(`Score: ${validation.score}/100`);
console.log(`Valid: ${validation.isValid}`);
```

### Test Cases

```bash
# Test 1: Valid JS
"function hello() { console.log('test'); }"

# Test 2: Plain text
"This is not code, just plain English text"

# Test 3: Mixed
"Create a function: function test() { }"

# Test 4: Minimal
"x = 5"

# Test 5: Comments only
"// This is a comment"
```

---

## Files Reference

| File                   | Purpose                         |
| ---------------------- | ------------------------------- |
| `inputValidator.js`    | JavaScript validation logic     |
| `input_validator.py`   | Python validation logic         |
| `analyzeController.js` | Backend validation integration  |
| `model.py`             | ML model validation integration |
| `ChatBot.jsx`          | Frontend error display          |
| `CodeEditor.jsx`       | Real-time validation display    |
| `api.js`               | API error handling              |
| `INPUT_VALIDATION.md`  | Full documentation              |
| `CHANGES_SUMMARY.md`   | Change log                      |

---

## Troubleshooting

### "WARNING: Input is very short"

```
Why: < 10 characters
Fix: Add more code or ignore warning
```

### "WARNING: No keywords detected"

```
Why: No language-specific keywords found
Fix: Add function, class, if, for, etc.
```

### "ERROR: Plain text detected"

```
Why: Too many common English words
Fix: Remove descriptions, keep code only
```

### "ERROR: Sentence structure detected"

```
Why: Multiple sentence endings (. ! ?)
Fix: Paste code, not descriptions
```

---

## Performance Notes

- Validation: < 20ms overhead
- Regex patterns optimized
- No additional API calls
- Cached keyword lists
- Client-side instant feedback

---

## Future Improvements

- [ ] ML-based code detection
- [ ] Custom language validators
- [ ] Real-time score display
- [ ] Language detection
- [ ] Code snippet suggestions
- [ ] Template code examples

---

## Support Resources

1. **INPUT_VALIDATION.md** - Full documentation
2. **CHANGES_SUMMARY.md** - What changed
3. **QUICK_START.md** - Project setup
4. **README.md** - General info
5. **Browser Console** - Error logs

---

**Last Updated**: April 20, 2026
**Version**: 1.0
**Status**: Production Ready ✅
