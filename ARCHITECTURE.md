# Architecture & Features Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (http://localhost:5173)              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   React + Vite Frontend                       │  │
│  │  ┌─────────────────┬──────────────────┬──────────────────┐  │  │
│  │  │                 │                  │                  │  │  │
│  │  │  CodeEditor     │  OutputPanel     │ RepoAnalyzer    │  │  │
│  │  │   (Monaco)      │   (Issues/AI)    │  (GitHub)       │  │  │
│  │  │                 │                  │                 │  │  │
│  │  └─────────────────┴──────────────────┴──────────────────┘  │  │
│  │            ↓                           ↓                     │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │   Axios HTTP Client (API Service)                    │  │  │
│  │  │   - analyzeCode()                                    │  │  │
│  │  │   - reviewCode()                                     │  │  │
│  │  │   - fixCode()                                        │  │  │
│  │  │   - analyzeRepository()                              │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│                         HTTPS/CORS                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   🖥️ BACKEND (http://localhost:5000)                │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Express Server (server.js)                  │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────────────┐  │  │
│  │  │ CORS     │ Logging  │ Auth     │ Error Handling       │  │  │
│  │  │ Handlers │ Handlers │ (future) │ Global middleware    │  │  │
│  │  └──────────┴──────────┴──────────┴──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Routes (analyzeRoutes.js)                │  │
│  │  POST /api/analyze      POST /api/review      POST /api/fix │  │
│  │  POST /api/analyze-repo POST /api/security    GET /health   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               Controller (analyzeController.js)              │  │
│  │  - Validates requests                                        │  │
│  │  - Orchestrates services                                     │  │
│  │  - Returns responses                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                            │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┐             │   │
│  │  │          │          │          │          │             │   │
│  │  │  AST     │ Lint     │ Rules    │   AI     │             │   │
│  │  │ Service  │ Service  │ Engine   │ Service  │             │   │
│  │  │          │          │          │          │             │   │
│  │  └──────────┴──────────┴──────────┴──────────┘             │   │
│  │   │          │          │          │                       │   │
│  │   ├─ Parse   ├─ ESLint  ├─ Custom  └─ OpenAI API          │   │
│  │   ├─ Analyze ├─ Python  │  Rules   └─ Claude 3.5 Sonnet   │   │
│  │   └─ Metrics │  Lint    └─ JS/Py                          │   │
│  │              │                                              │   │
│  │   Babel      Babel +    JavaScript Python    OpenAI        │   │
│  │   @babel     ESLint     Custom     Rules      API Call      │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              External APIs & Libraries                      │   │
│  │  ┌──────────────────┬─────────────────────────────────────┐ │   │
│  │  │                  │                                     │ │   │
│  │  │  OpenAI          │  GitHub API                         │ │   │
│  │  │  Claude 3.5      │  Repository content                 │ │   │
│  │  │  Sonnet          │  File analysis                      │ │   │
│  │  │                  │                                     │ │   │
│  │  └──────────────────┴─────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
User Input (Code)
     ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ FRONTEND                                                       │
│ ┌──────────────────┐   Debounce    ┌──────────────┐           │
│ │  CodeEditor      │    (700ms)    │  API Client  │           │
│ │  onChange event  ├───────────────→             │           │
│ └──────────────────┘               └──────┬───────┘           │
│                                           ↓                   │
│                                   ┌──────────────────┐        │
│                                   │ Send to Backend  │        │
│                                   │ POST /analyze    │        │
│                                   └────────┬─────────┘        │
│                                            │                  │
│                                            ↓ HTTP Request      │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ BACKEND                                                        │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Controller receives request                              │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ 1. Extract code & language                               │ │
│ │ 2. Call multiple services in parallel                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│   ├─ AST Service              ├─ Lint Service              │
│   │  ├─ Babel Parse            │  ├─ ESLint (JS)           │
│   │  ├─ Traverse AST           │  ├─ Python Lint           │
│   │  └─ Extract Metrics        │  └─ Return Issues         │
│   │                            │                            │
│   └─ Rule Engine                                           │
│      ├─ Custom JS Rules                                    │
│      ├─ Custom Python Rules                                │
│      └─ Security Checks                                    │
│                                                            │
│ 3. Combine Results                                         │
│    {                                                       │
│      issues: [...],                                        │
│      codeLines: [...],                                     │
│      astAnalysis: {...}                                    │
│    }                                                       │
│                                                            │
│ 4. Send Response                                           │
└──────────────────────────────────────────────────────────────┘
     ↓ HTTP Response
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ FRONTEND                                                   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Receive Response                                     │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 1. Update state (issues, metrics)                   │ │
│ │ 2. Convert issues to Monaco markers                 │ │
│ │ 3. Display issues in OutputPanel                    │ │
│ │ 4. Show inline error squiggles                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Display Results                                          │
│ ├─ Inline error markers (red/yellow/blue squiggles)     │
│ ├─ Gutter icons                                         │
│ ├─ Issue list in sidebar                                │
│ └─ Code metrics                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘

User sees results immediately with syntax highlighting
```

---

## Feature Architecture

```
AI CODE REVIEWER
│
├─ 1️⃣ CODE EDITING
│  ├─ Monaco Editor
│  ├─ Language selector
│  ├─ Dark theme
│  ├─ Syntax highlighting
│  ├─ Line numbers & minimap
│  └─ Copy/paste support
│
├─ 2️⃣ REAL-TIME LINTING
│  ├─ 700ms debounce
│  ├─ ESLint integration
│  ├─ Python linter
│  ├─ Custom rules
│  ├─ Per-line analysis
│  └─ Issue categorization
│     ├─ Errors (high priority)
│     ├─ Warnings (medium)
│     └─ Info (low)
│
├─ 3️⃣ INLINE HIGHLIGHTING
│  ├─ Red squiggles (errors)
│  ├─ Yellow squiggles (warnings)
│  ├─ Blue squiggles (info)
│  ├─ Hover tooltips
│  ├─ Gutter icons
│  └─ Problem panel
│
├─ 4️⃣ AST ANALYSIS
│  ├─ Babel parser
│  ├─ Code traversal
│  ├─ Metrics extraction
│  │  ├─ Complexity score
│  │  ├─ Functions detected
│  │  ├─ Variables tracked
│  │  └─ Imports analyzed
│  └─ Code structure
│
├─ 5️⃣ AI CODE REVIEW
│  ├─ OpenAI integration
│  ├─ Claude 3.5 Sonnet
│  ├─ Code explanation
│  ├─ Suggestions
│  ├─ Security analysis
│  └─ Performance tips
│
├─ 6️⃣ AUTO-FIX ENGINE
│  ├─ One-click fix
│  ├─ AI-powered repair
│  ├─ Issue resolution
│  ├─ Code formatting
│  ├─ Best practices
│  └─ Maintains functionality
│
├─ 7️⃣ SECURITY SCANNING
│  ├─ Hardcoded secrets
│  ├─ Unsafe patterns
│  ├─ SQL injection risks
│  ├─ XSS vulnerabilities
│  ├─ CSRF checks
│  └─ Vulnerability report
│
├─ 8️⃣ GITHUB INTEGRATION
│  ├─ Repo URL input
│  ├─ GitHub API client
│  ├─ Multi-file analysis
│  ├─ Token authentication
│  ├─ Results dashboard
│  └─ Issue per file
│
├─ 9️⃣ MULTI-LANGUAGE SUPPORT
│  ├─ JavaScript
│  ├─ TypeScript
│  ├─ Python
│  ├─ Java
│  ├─ C++
│  └─ CSS/HTML (syntax)
│
└─ 🔟 USER INTERFACE
   ├─ Glassmorphism design
   ├─ Framer animations
   ├─ Dark theme
   ├─ Responsive layout
   ├─ Smooth transitions
   └─ Loading states
```

---

## Component Hierarchy

```
App.jsx (Main Container)
│
├─ Header
│  ├─ Logo + Team Info
│  ├─ GitHub Button
│  └─ Repo Analyzer Button
│
├─ Main Content (Grid Layout)
│  ├─ CodeEditor Component (2/3 width)
│  │  ├─ Language Selector
│  │  ├─ Monaco Editor
│  │  ├─ Auto Fix Button
│  │  └─ Status Bar
│  │
│  └─ OutputPanel Component (1/3 width)
│     ├─ Tab Navigation
│     │  ├─ Issues Tab
│     │  ├─ AI Review Tab
│     │  └─ Security Tab
│     │
│     └─ Content Area
│        ├─ Issues List
│        │  ├─ Issue Cards
│        │  ├─ Expandable Details
│        │  └─ Severity Badges
│        │
│        ├─ AI Review
│        │  └─ Formatted Feedback
│        │
│        └─ Security Issues
│           └─ Vulnerability List
│
├─ Features Section
│  ├─ Real-time Linting
│  ├─ AI Suggestions
│  ├─ Auto Fix
│  └─ Security Analysis
│
├─ About Section
│  └─ Project Description
│
├─ RepoAnalyzer Modal
│  ├─ URL Input
│  ├─ Analyze Button
│  ├─ Results Display
│  └─ Close Button
│
└─ Loading Indicator (conditional)
```

---

## Service Layer Diagram

```
controllers/analyzeController.js
│
├─ analyzeCode()
│  └─ Calls:
│     ├─ astService.parseJavaScript()
│     ├─ astService.analyzeAST()
│     ├─ lintService.lintJavaScript()
│     └─ ruleEngine.analyzeCodeRules()
│
├─ reviewCode()
│  └─ Calls:
│     └─ aiService.getCodeReview()
│
├─ fixCode()
│  └─ Calls:
│     └─ aiService.getFixedCode()
│
├─ analyzeRepository()
│  └─ Calls:
│     ├─ GitHub API (fetch files)
│     ├─ lintService.lintJavaScript/lintPython()
│     └─ ruleEngine.analyzeCodeRules()
│
└─ analyzeSecurityIssues()
   └─ Calls:
      └─ aiService.analyzeSecurityVulnerabilities()
```

---

## API Request/Response Examples

### Example 1: Code Analysis

**Request:**

```json
POST /api/analyze
{
  "code": "var x = 1;\nconsole.log(x);",
  "language": "javascript"
}
```

**Response:**

```json
{
  "success": true,
  "issues": [
    {
      "line": 1,
      "column": 1,
      "severity": "warning",
      "message": "Prefer 'let' or 'const' over 'var'",
      "ruleId": "no-var"
    },
    {
      "line": 2,
      "column": 1,
      "severity": "warning",
      "message": "Remove console.log before production",
      "ruleId": "no-console"
    }
  ]
}
```

### Example 2: AI Review

**Request:**

```json
POST /api/review
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "issues": []
}
```

**Response:**

```json
{
  "success": true,
  "review": {
    "explanation": "This is a simple pure function that...",
    "suggestions": [
      "Add JSDoc comments for documentation",
      "Consider handling edge cases"
    ],
    "improvedCode": "/**\n * Adds two numbers\n */\nfunction add(a, b) {\n  return a + b;\n}"
  }
}
```

---

## State Management

### Frontend State (React)

```javascript
// CodeEditor Component
- code: string          // Current code in editor
- language: string      // Selected language
- loading: boolean      // Analysis in progress
- issues: array         // Found issues
- markers: array        // Monaco markers

// OutputPanel Component
- activeTab: string     // Current tab
- aiReview: object      // AI review results
- securityIssues: array // Security findings
- expandedIssue: number // Expanded issue index

// App Component
- code: string          // Global code state
- language: string      // Global language
- issues: array         // Global issues
- loading: boolean      // Global loading
- repoAnalyzerOpen: bool // Modal visibility
```

---

## Performance Optimization

```
Frontend Optimization
├─ Debounce: 700ms (typing)
├─ Memoization: useMemo hooks
├─ Lazy Loading: Code splitting
├─ Virtualization: For issue lists
└─ CSS Performance: Tailwind optimization

Backend Optimization
├─ Parallel Processing: Multiple services
├─ Caching: Request results
├─ Connection Pooling: Database (future)
├─ Compression: gzip response
└─ Rate Limiting: API protection
```

---

## Error Handling Flow

```
Request
  ↓
Try-Catch Block
  ├─ Success → Process & return
  │
  └─ Error →
     ├─ Log error
     ├─ Format error response
     ├─ Return error code (400/500)
     └─ Send to frontend
           ↓
        Display in UI
        ├─ Error toast
        ├─ In console
        └─ In error state
```

---

## Deployment Architecture

```
Production Setup
│
├─ Frontend
│  ├─ Build: npm run build
│  ├─ Output: dist/ folder
│  ├─ Deploy to: Vercel/Netlify
│  └─ URL: https://yourdomain.com
│
├─ Backend
│  ├─ Docker image (optional)
│  ├─ Deploy to: Heroku/AWS/GCP
│  ├─ Environment: Node.js 16+
│  └─ URL: https://api.yourdomain.com
│
└─ Database (Future)
   ├─ MongoDB (NoSQL)
   └─ PostgreSQL (SQL)
```

---

**This architecture ensures scalability, maintainability, and excellent performance!**
