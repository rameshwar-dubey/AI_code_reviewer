# AI/ML-Powered Code Analysis

This document explains the AI and Machine Learning capabilities of the AI Code Reviewer.

## Overview

The application now uses **Claude 3.5 Sonnet** (OpenAI API) to perform intelligent code analysis beyond traditional linting. This includes:

- **AI Error Detection**: Identifies logical errors, runtime issues, and edge cases
- **Pattern Recognition**: Detects common coding mistakes and anti-patterns
- **Code Quality Metrics**: Evaluates complexity, performance, and best practices
- **Deep Analysis**: Comprehensive ML-based code assessment

## Features

### 1. Real-Time Analysis (Automatic)

When you type code, the system automatically:

1. **Runs Traditional Linting** - Detects syntax errors, style issues
2. **Applies Custom Rules** - Language-specific code quality checks
3. **AI Error Detection** - Uses Claude to find logical and runtime errors

**AI errors are marked with red squiggly lines** and include:

- Logic errors and bugs
- Potential runtime exceptions
- Incorrect algorithms
- Missing error handling
- Unhandled edge cases

### 2. Deep Analysis (Manual)

Access comprehensive AI analysis with:

- **Code Quality Score** (0-100)
- **Detailed Error Analysis** - All issues categorized
- **Performance Assessment** - Bottlenecks and inefficiencies
- **Complexity Metrics** - Cyclomatic complexity
- **Best Practices Report** - What the code does well and what needs improvement
- **Actionable Suggestions** - Specific improvements recommended

**How to use:**

1. Open a code snippet in the editor
2. Click the "Deep Analyze" button (or use the tab)
3. View comprehensive AI analysis report

### 3. Security Analysis

AI-powered security vulnerability detection identifies:

- Data leaks and unsafe patterns
- Authentication/authorization issues
- Input validation problems
- SQL injection risks
- Cross-site scripting vulnerabilities

### 4. Auto Fix (Enhanced with AI)

The Auto Fix feature now uses AI to:

1. Understand the code's intent
2. Apply best-practice fixes
3. Improve code quality automatically
4. Maintain functionality while fixing issues

## How It Works

### Analysis Pipeline

```
Code Input
    ↓
[Traditional Linting] (ESLint, regex-based)
    ↓
[Custom Rules Engine] (Language-specific)
    ↓
[AI Error Detection] (Claude)
    ↓
[Merge & Dedup] (Remove duplicate issues)
    ↓
[Display to User] (Monaco markers + issue list)
```

### AI Model Details

- **Model**: Claude 3.5 Sonnet (state-of-the-art LLM)
- **Context**: Analyzes full code with language context
- **Detection Types**: Logic, runtime, performance, security, style
- **Output Format**: Structured JSON with line numbers and severity levels

## Error Detection Capabilities

### Logic Errors

- Incorrect conditions or boolean logic
- Variable scope issues
- Infinite loops or deadlocks
- Unreachable code

### Runtime Errors

- Null/undefined pointer exceptions
- Type mismatches
- Array index out of bounds
- Division by zero

### Algorithm Issues

- Inefficient implementations
- O(n²) algorithms when O(n) possible
- Incorrect sorting or searching
- Off-by-one errors

### Best Practices

- Missing error handling
- Poor variable naming
- Code duplication
- Inconsistent style

## Configuration

### Enable AI Analysis

1. Get an OpenAI API key:
   - Visit https://platform.openai.com/api-keys
   - Create a new secret key
   - Copy the key (starts with `sk-proj-`)

2. Update `backend/.env`:

   ```
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

3. Restart the backend:
   ```bash
   npm run dev  # in backend directory
   ```

### Disable AI Analysis

If you want to use only traditional linting (to save API costs):

- Set `OPENAI_API_KEY` to empty or remove it
- Traditional linting will still work perfectly

## API Endpoints

### POST /api/analyze

Real-time analysis with AI error detection

**Request:**

```json
{
  "code": "function add(a, b) { return a + c; }",
  "language": "javascript"
}
```

**Response includes:**

- Traditional linting issues
- AI-detected errors
- Custom rule violations

### POST /api/deep-analyze

Comprehensive ML-based analysis

**Request:**

```json
{
  "code": "...",
  "language": "javascript"
}
```

**Response:**

```json
{
  "analysis": {
    "summary": "Description of code",
    "codeQuality": {
      "score": 75,
      "assessment": "Good code with minor improvements"
    },
    "errors": [...],
    "warnings": [...],
    "improvements": [...],
    "bestPractices": {...},
    "complexity": {...},
    "performance": {...}
  }
}
```

## Supported Languages

- JavaScript / TypeScript
- Python
- Java
- C++

Each language has:

- Traditional linter support
- Custom rule engine
- AI error detection
- Deep analysis capability

## Limitations & Considerations

### API Rate Limiting

- OpenAI API has rate limits based on your plan
- Consider disabling AI analysis for very long sessions to save costs

### Accuracy

- AI analysis is powerful but not 100% accurate
- Always review AI suggestions before implementing
- Combine with traditional linting for best results

### Cost

- Each AI analysis call uses API tokens
- Deep analysis uses more tokens than real-time analysis
- Free tier: Limited requests per month
- Paid tier: Based on actual token usage

### Code Privacy

- Code is sent to OpenAI API
- Does not store your code permanently
- Review OpenAI's privacy policy: https://openai.com/policies/privacy-policy

## Performance Tips

1. **Use Real-Time Analysis** for quick feedback (always on)
2. **Use Deep Analysis** for in-depth reviews of important code
3. **Disable AI** in the backend if you just want traditional linting
4. **Focus on Critical Code** - prioritize analyzing security-sensitive code
5. **Regular Commits** - analyze code chunks, not entire files

## Examples

### Example 1: Logic Error Detection

Input Code:

```javascript
function findUser(id) {
  const user = getUser(id);
  if (user) {
    console.log(user.name);
  }
  return user.email; // ❌ Error: user might be null
}
```

AI Detection:

```
Line 7: Null pointer exception - user could be undefined
Severity: error
Type: runtime
```

### Example 2: Performance Issue

Input Code:

```javascript
function getDuplicates(arr) {
  return arr.filter((item) => arr.filter((x) => x === item).length > 1);
}
```

AI Detection:

```
Line 2: O(n²) complexity - nested loops
Severity: warning
Type: performance
Suggestion: Use Set for O(n) solution
```

### Example 3: Best Practice

Input Code:

```javascript
function validateEmail(email) {
  var isValid = true;
  if (!email.includes("@")) {
    isValid = false;
  }
  return isValid;
}
```

AI Detection:

```
Use const/let instead of var
Simplify logic: return email.includes('@')
```

## Troubleshooting

### AI Analysis Not Running

1. Check API key is set correctly (no "placeholder")
2. Verify key starts with `sk-proj-`
3. Restart backend after updating .env
4. Check browser console for errors (F12)

### High API Costs

1. Consider analyzing only critical code
2. Disable AI analysis if not needed
3. Use traditional linting only (free)
4. Monitor usage at https://platform.openai.com/account/usage

### Slow Analysis

1. Large code files take longer
2. Try analyzing smaller chunks
3. Close other browser tabs to free memory
4. Check internet connection

## Future Enhancements

- [ ] Custom ML models for specific frameworks
- [ ] Real-time bug prediction
- [ ] Automated refactoring suggestions
- [ ] Code smell detection
- [ ] Test coverage recommendations
- [ ] Documentation generation

## References

- Claude API Documentation: https://docs.anthropic.com/
- OpenAI API: https://platform.openai.com/docs
- Code Analysis Best Practices: https://en.wikipedia.org/wiki/Static_program_analysis
