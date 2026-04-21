# 🤖 AI Code Reviewer - Intelligent Code Review System

A sophisticated AI + ML system that automatically reviews code, detects errors, and generates optimized versions using an intelligent multi-stage pipeline.

## 🎯 Architecture Overview

```
USER CODE
    ↓
┌─────────────────────────────────┐
│  AUTOMATIC PIPELINE SYSTEM      │
├─────────────────────────────────┤
│ 1. ESLint → Syntax/Rule Errors  │
│ 2. AST → Structural Issues      │
│ 3. ML Model → Quality Scoring   │
│ 4. OpenAI → AI Review & Fix     │
└─────────────────────────────────┘
    ↓
COMPREHENSIVE ANALYSIS
├─ Errors (categorized)
├─ ML Score (0-100)
├─ Risk Level (Low/Medium/High)
├─ AI Explanation
└─ Optimized Code
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Python 3.8+
- OpenAI API Key

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
OPENAI_API_KEY=sk-xxx...
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

### 2. ML Service Setup

```bash
cd ml_service
pip install -r requirements.txt
```

Create `.env` file:

```env
FLASK_DEBUG=True
ML_SERVICE_PORT=5001
```

Start ML service:

```bash
python app.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📋 API Endpoints

### Pipeline Endpoints (New)

**POST `/api/pipeline/analyze`**

```json
{
  "code": "function hello() { console.log('hi'); }",
  "language": "javascript"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "timestamp": "2026-04-20T...",
    "language": "javascript",
    "errors": {
      "lint": [...],
      "structural": [...],
      "total_issues": 2
    },
    "ml_analysis": {
      "score": 82,
      "risk_level": "Low",
      "features": {...}
    },
    "ai_review": {
      "explanation": "...",
      "suggestions": [...],
      "optimized_code": "..."
    },
    "summary": {
      "total_errors": 2,
      "quality_score": 82,
      "risk_assessment": "Low",
      "recommendation": "✅ LOW RISK - Code is ready for production"
    }
  }
}
```

**POST `/api/pipeline/chat`**

```json
{
  "code": "...",
  "message": "How can I improve this?",
  "language": "javascript"
}
```

**POST `/api/pipeline/fix`**

```json
{
  "code": "...",
  "language": "javascript",
  "specificFix": "Make it more concise"
}
```

**POST `/api/pipeline/batch-analyze`**

```json
{
  "codes": ["code1", "code2", ...],
  "language": "javascript"
}
```

## 🎨 Frontend Features

### Code Editor (Monaco)

- Real-time syntax highlighting
- Automatic code analysis (debounced 700ms)
- Inline error markers
- Support for 5+ languages
- Glassmorphism design

### Output Panel

- **Summary**: Total errors, quality score, risk level
- **Errors**: Categorized lint + structural issues
- **ML Analysis**: Quality scoring with metrics
- **Before/After**: Code comparison view
- **AI Review**: Detailed analysis and suggestions

### Status Indicators

- Real-time analysis status
- Error count
- Quality score (0-100)
- Risk level assessment

## 🤖 ML Model

### Features Extracted

- `num_lines`: Total lines of code
- `num_functions`: Function count
- `max_nesting_depth`: Deepest nesting level
- `num_unused_vars`: Unused variable count
- `comment_ratio`: Documentation ratio
- `has_error_handling`: Boolean
- `has_type_hints`: Boolean
- `cyclomatic_complexity`: Code complexity

### Scoring Algorithm

- **Maintainability Score**: 0-100 based on features
- **Risk Levels**: Low (80+), Medium (60-79), High (<60)
- **Model**: RandomForestClassifier (scikit-learn)

## 🔧 Configuration

### Backend (.env)

```env
PORT=5000
OPENAI_API_KEY=sk-xxx...
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### ML Service (.env)

```env
FLASK_DEBUG=True
ML_SERVICE_PORT=5001
```

## 📊 Data Flow

1. **User Input**: Code submission via editor/chat
2. **ESLint**: Quick syntax/rule checking
3. **AST Analysis**: Deep structural inspection
4. **ML Scoring**: Quality assessment
5. **OpenAI**: Comprehensive review generation
6. **UI Display**: Real-time results in OutputPanel

## 🎯 Key Features

✅ **Automatic Pipeline**: No manual steps required  
✅ **Real-time Analysis**: Debounced (700ms) as you type  
✅ **Multi-language Support**: JavaScript, TypeScript, Python, Java, C++  
✅ **Error Categorization**: Critical, Major, Minor errors  
✅ **ML Scoring**: 0-100 quality score with risk assessment  
✅ **AI-Generated Code**: Optimized code suggestions  
✅ **Chat Interface**: Ask questions about code  
✅ **Glassmorphism UI**: Modern dark theme with animations  
✅ **Before/After Comparison**: Visual diff view

## 🔒 Security

- OpenAI API key stored securely in backend .env
- CORS configured for development
- ML service on separate port
- No code stored in database

## 📈 Performance

- Real-time linting: <100ms
- ML analysis: <500ms
- OpenAI review: 1-3s
- Total pipeline: 2-4s average

## 🐛 Troubleshooting

**Analysis not working?**

- Check OpenAI API key in backend/.env
- Verify ML service is running on port 5001
- Check browser console for errors

**ML Service errors?**

- Reinstall Python dependencies: `pip install -r requirements.txt`
- Check Python version (3.8+)
- Verify scikit-learn installation

**Frontend not connecting?**

- Check API_BASE_URL in frontend/src/utils/api.js
- Ensure backend is running on port 5000
- Check CORS configuration

## 📝 License

MIT

## 👥 Team

- Rameshwar Dubey
- Sumit Shukla
- Raunak Chaturvedi
- Anjali Saraswat
