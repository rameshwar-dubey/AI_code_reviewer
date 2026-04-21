# ML Error Detection Test Guide

## Quick Start Testing

### 1. Ensure Services Are Running

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: ML Service
cd ml_service
python app.py

# Terminal 3: Frontend
cd frontend
npm run dev
```

All services should be running:

- Backend: http://localhost:5000
- ML Service: http://localhost:5001
- Frontend: http://localhost:5173

### 2. Test ML Error Detection via Frontend

1. Open http://localhost:5173 in your browser
2. Paste buggy Python code:

```python
def calculateTotal(items):
    total=0
    for item in items:
        if item['price']>0:
            if item['quantity']>0:
                if item['available']:
                    total = total + item['price'] * item['quantity']
    return total
```

3. Click "Review"
4. Observe:
   - ✨ Corrected Code (yellow highlight)
   - 🔍 ML Error Detection (cyan box showing detected errors)
   - 📋 What Was Fixed (explanation)
   - 💡 Improvements Made (suggestions)

### 3. Test ML Endpoints Directly

#### Test Error Detection

```bash
curl -X POST http://localhost:5001/detect-errors \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def calculateTotal(items):\n    total=0\n    for item in items:\n        if item[\"price\"]>0:\n            if item[\"quantity\"]>0:\n                if item[\"available\"]:\n                    total = total + item[\"price\"] * item[\"quantity\"]\n    return total",
    "language": "python"
  }'
```

Expected response includes:

```json
{
  "success": true,
  "errors": [
    {
      "type": "NAMING",
      "severity": "MEDIUM",
      "message": "Python variables use camelCase instead of snake_case",
      ...
    }
  ],
  "warnings": [...],
  "total_errors": 1,
  "error_score": 85
}
```

#### Test Code Correction

```bash
curl -X POST http://localhost:5001/correct-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def calculateTotal(items):\n    total=0\n    return total",
    "language": "python"
  }'
```

Expected response includes:

```json
{
  "success": true,
  "corrected_code": "def calculate_total(items):\n    total = 0\n    return total",
  "fixes_applied": [
    "Renamed variable 'calculateTotal' to 'calculate_total' (Python convention)",
    "Added spaces around operators"
  ],
  "improvements": 2
}
```

#### Test Full Pipeline

```bash
curl -X POST http://localhost:5000/api/analyze/pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def calculateTotal(items):\n    total=0\n    for item in items:\n        total = total + item\n    return total",
    "language": "python"
  }'
```

Expected response includes all stages:

- Lint errors
- AST issues
- ML errors detected
- Corrected code
- AI suggestions

### 4. Test Different Languages

#### JavaScript

```javascript
function calculateTotal(items) {
  var total = 0;
  for (let item of items) {
    if (item.price > 0) {
      if (item.quantity > 0) {
        total = total + item.price * item.quantity;
      }
    }
  }
  return total;
}
```

Expects fixes: `var` → `const`, spacing, semicolons

#### Java

```java
class Calculator{
public int calculateTotal(int[] items){
int total=0;
for(int i=0;i<items.length;i++){
if(items[i]>0){
total = total + items[i];
}
}
return total;
}
}
```

Expects fixes: Access modifiers, spacing, formatting

### 5. Monitor ML Service Logs

Check the console output while testing:

```
[ML Service] POST /detect-errors
[ML Service] Detecting errors in 123 lines of code
[ML Service] Found 3 errors, 5 warnings
[ML Service] Error detection: 0.234s
```

### 6. Common Test Scenarios

#### Scenario 1: Complex Code

Input code with:

- High nesting (5+ levels)
- Large functions (50+ lines)
- Missing documentation

Expected: Multiple COMPLEXITY and DOCUMENTATION errors

#### Scenario 2: Poor Naming

Input code with:

- camelCase in Python
- snake_case in JavaScript

Expected: NAMING errors with suggestions

#### Scenario 3: Missing Error Handling

Input code with:

- No try-catch
- No error checks

Expected: ERROR_HANDLING warnings

#### Scenario 4: Performance Issues

Input code with:

- Triple nested loops
- String concatenation in loop

Expected: PERFORMANCE warnings

### 7. Verify Integration

Check that:

1. ✓ ML errors appear in the "🔍 ML Error Detection" box
2. ✓ Corrected code is displayed prominently
3. ✓ Fixes applied count matches number of improvements
4. ✓ Error details include type, severity, and suggestions
5. ✓ ML improvements are tracked in summary

### 8. Troubleshooting

**ML Service not responding:**

- Check port 5001: `netstat -an | findstr 5001`
- Check Python environment has scikit-learn: `pip list | grep scikit-learn`
- Check imports in app.py and model.py

**No errors detected:**

- Verify code has actual issues
- Check language is correctly specified
- Look at ML service logs

**Corrected code is same as original:**

- Check if code already follows conventions
- Try code with explicit issues (camelCase in Python)
- Check code_corrector.py is imported

**Frontend not showing ML detection:**

- Open DevTools (F12) → Console tab
- Check for JavaScript errors
- Verify ChatBot.jsx has ml_detection rendering
- Check API response includes error data

### 9. Performance Testing

Time the analysis:

```bash
# Time from submission to response
curl -w "Total: %{time_total}s\n" -X POST http://localhost:5000/api/analyze/pipeline \
  -H "Content-Type: application/json" \
  -d '{"code": "def test():\n    pass", "language": "python"}'
```

Expected: < 3 seconds total

- ML error detection: < 500ms
- Code correction: < 300ms
- AI review: < 2s (depends on OpenAI)

### 10. Load Testing

Test with larger code files:

```python
# Generate large Python file
code = "def function():\n    pass\n" * 100
```

Expected: Should handle up to 10MB files

## Success Criteria

✓ ML error detection responds within 500ms
✓ Code correction identifies language-specific fixes
✓ Frontend displays all error categories
✓ Corrected code is prominently shown
✓ Error severity levels are color-coded
✓ Pipeline completes all 4 stages
✓ AI review incorporates ML error details
