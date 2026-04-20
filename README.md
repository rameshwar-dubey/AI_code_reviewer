# AI Code Reviewer - Full Stack Application

A cutting-edge VS Code-like web application for real-time code analysis, AI-powered suggestions, and GitHub repository analysis.

## Project Overview

**Team:** Tech Titans  
**Members:** Rameshwar Dubey, Sumit Shukla, Raunak Chaturvedi, Anjali Saraswat

### Core Features

✅ **Real-time Code Analysis** - Linting with ESLint and custom rule engine  
✅ **AI Code Review** - Powered by OpenAI API  
✅ **Auto Fix** - One-click code improvements  
✅ **Security Analysis** - Vulnerability detection  
✅ **GitHub Integration** - Repository analysis  
✅ **Multi-language Support** - JavaScript, Python, TypeScript, Java, C++  
✅ **Monaco Editor** - Professional code editing experience  
✅ **Glassmorphism UI** - Modern, animated interface

---

## Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Parsing:** Babel Parser (@babel/parser)
- **Linting:** ESLint
- **AI:** OpenAI API (Claude 3.5 Sonnet)
- **Package Manager:** npm

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Editor:** Monaco Editor
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Icons:** React Icons

---

## 📁 Project Structure

```
aiCodeReviewer/
├── backend/                          # Node.js Express Server
│   ├── controllers/
│   │   └── analyzeController.js      # Request handlers
│   ├── services/
│   │   ├── astService.js             # AST parsing & analysis
│   │   ├── lintService.js            # ESLint integration
│   │   ├── ruleEngine.js             # Custom code rules
│   │   └── aiService.js              # OpenAI integration
│   ├── routes/
│   │   └── analyzeRoutes.js          # API endpoints
│   ├── package.json                  # Dependencies
│   ├── server.js                     # Main server file
│   └── .env.example                  # Environment variables template
│
├── frontend/                         # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx        # Monaco editor integration
│   │   │   ├── OutputPanel.jsx       # Issues & feedback display
│   │   │   └── RepoAnalyzer.jsx      # GitHub integration
│   │   ├── utils/
│   │   │   ├── api.js                # API service
│   │   │   └── helpers.js            # Utility functions
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind configuration
│   └── postcss.config.js             # PostCSS configuration
│
└── README.md                         # This file
```

---

## Quick Start Guide

### Prerequisites

- **Node.js:** v16 or higher
- **npm:** v8 or higher
- **OpenAI API Key:** [Get one here](https://platform.openai.com/api-keys)
- **GitHub Token** (Optional): [Create one here](https://github.com/settings/tokens)

### Step 1: Clone/Extract Project

```bash
cd aiCodeReviewer
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_token_here
NODE_ENV=development
```

**How to get API keys:**

1. **OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key
   - Copy and paste into `.env`

2. **GitHub Token** (Optional):
   - Go to https://github.com/settings/tokens
   - Click "Generate new token"
   - Select scopes: `repo`, `read:user`
   - Copy and paste into `.env`

### Step 3: Start Backend Server

**Development with auto-reload:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Expected output:

```
╔════════════════════════════════════════════════════════════════╗
║          AI CODE REVIEWER - BACKEND SERVER STARTED             ║
╠════════════════════════════════════════════════════════════════╣
║ Server running on: http://localhost:5000
║ Environment: development
║ OpenAI API: ✓ Configured
║ GitHub Token: ✓ Configured
╚════════════════════════════════════════════════════════════════╝
```

### Testing Backend

```bash
curl http://localhost:5000/
```

Should return API info and available endpoints.

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd ../frontend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

Expected output:

```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Open Browser

Navigate to: **http://localhost:5173**

You should see the AI Code Reviewer interface!

---

## 📡 API Endpoints Reference

### Base URL: `http://localhost:5000/api`

#### 1. Analyze Code

```
POST /analyze
Body: { code, language }
Response: { issues, codeLines, astAnalysis }
```

**Example:**

```javascript
const response = await fetch("http://localhost:5000/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: "var x = 1;",
    language: "javascript",
  }),
});
```

#### 2. Get AI Review

```
POST /review
Body: { code, language, issues }
Response: { review: { explanation, suggestions, improvedCode } }
```

#### 3. Auto Fix Code

```
POST /fix
Body: { code, language, issues }
Response: { originalCode, fixedCode }
```

#### 4. Analyze GitHub Repository

```
POST /analyze-repo
Body: { repoUrl }
Response: { repository, files, totalFilesAnalyzed }
```

**Example:**

```bash
curl -X POST http://localhost:5000/api/analyze-repo \
  -H 'Content-Type: application/json' \
  -d '{"repoUrl": "https://github.com/facebook/react"}'
```

#### 5. Security Analysis

```
POST /security
Body: { code, language }
Response: { securityIssues }
```

#### 6. Health Check

```
GET /health
Response: { status, message, timestamp }
```

---

## 🎮 Usage Guide

### Using the Editor

1. **Paste Code:** Copy-paste any code into the editor
2. **Select Language:** Choose language from dropdown (JavaScript, Python, etc.)
3. **Real-time Analysis:** Issues appear automatically (700ms debounce)
4. **View Issues:** Click on issues in the right panel for details
5. **Get AI Review:** Click "AI Review" button for suggestions
6. **Auto Fix:** Click "Auto Fix" to apply improvements
7. **Security Check:** Click "Security" to scan for vulnerabilities

### Analyzing GitHub Repositories

1. Click the **GitHub** button in the header
2. Enter repository URL: `https://github.com/owner/repo`
3. Click **Analyze**
4. View issues per file

### Keyboard Shortcuts

| Shortcut | Action         |
| -------- | -------------- |
| `Ctrl+K` | Format code    |
| `Ctrl+/` | Toggle comment |
| `Ctrl+Z` | Undo           |
| `Ctrl+Y` | Redo           |

---

## Features Explained

### 1. Real-time Linting

- Analyzes code as you type (700ms debounce)
- Shows errors, warnings, and info messages
- Highlights exact error locations with markers
- Supports ESLint rules

### 2. Inline Error Highlighting

- Red squiggly for errors
- Yellow squiggly for warnings
- Blue squiggly for info
- Hover to see full message

### 3. AST Analysis

- Parses JavaScript with Babel
- Analyzes code complexity
- Detects functions, variables, imports
- Shows code metrics in feedback

### 4. AI-Powered Review

- Sends code to OpenAI Claude 3.5 Sonnet
- Returns:
  - Code explanation
  - Suggestions for improvement
  - Security and performance concerns
  - Best practices

### 5. Auto Fix

- Click "Auto Fix" button
- Uses AI to fix detected issues
- Maintains code functionality
- Follows best practices

### 6. Security Analysis

- Scans for hardcoded secrets
- Detects unsafe patterns
- Identifies potential vulnerabilities
- Uses custom rules and AI analysis

### 7. GitHub Integration

- Analyzes multiple files from repo
- Fetches via GitHub API
- Shows issues per file
- Supports up to 5 files per analysis

---

## 🐛 Troubleshooting

### Backend won't start

**Issue:** `EADDRINUSE: address already in use :::5000`

**Solution:**

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Frontend can't connect to backend

**Issue:** `CORS error` or `Network error`

**Solution:**

1. Ensure backend is running: `curl http://localhost:5000/`
2. Check CORS configuration in `backend/server.js`
3. Verify frontend proxy in `frontend/vite.config.js`

### OpenAI API not working

**Issue:** `401 Unauthorized` or empty responses

**Solution:**

1. Verify API key in `.env` file
2. Check API key on https://platform.openai.com/account/api-keys
3. Ensure account has available credits
4. Try different model name in `aiService.js`

### Monaco Editor not loading

**Issue:** Editor is blank or showing errors

**Solution:**

```bash
cd frontend
npm install @monaco-editor/react
npm run dev
```

### GitHub repo analysis fails

**Issue:** `Failed to fetch repository` error

**Solution:**

1. Check repository URL format: `https://github.com/owner/repo`
2. Ensure repository is public
3. Add GitHub token to `.env` for private repos
4. Check GitHub API rate limits (60 requests/hour without token)

---

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

Output: `frontend/dist/` folder

### Backend Production Setup

1. Set environment:

```bash
export NODE_ENV=production
export OPENAI_API_KEY=your_key
```

2. Install only production dependencies:

```bash
npm ci --only=production
```

3. Start server:

```bash
npm start
```

### Deployment Suggestions

- **Frontend:** Deploy `dist/` folder to Vercel, Netlify, or GitHub Pages
- **Backend:** Deploy to Heroku, AWS Lambda, or DigitalOcean

---

## Customization

### Add New Linting Rules

Edit `backend/services/ruleEngine.js`:

```javascript
export const checkJavaScriptRules = (code) => {
  const violations = [];
  // Add your rules here
  return violations;
};
```

### Modify Editor Theme

Edit `frontend/src/components/CodeEditor.jsx`:

```javascript
<Editor
  theme="vs-light" // Change to different theme
  // ...
/>
```

Available themes: `vs-dark`, `vs-light`, `hc-black`, `hc-light`

### Change AI Model

Edit `backend/services/aiService.js`:

```javascript
const message = await client.messages.create({
  model: "claude-3-opus-20240229", // Change model
  max_tokens: 1024,
  // ...
});
```

---

## 🤝 Contributing

Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - Feel free to use this project!

---

## 👥 Team Information

| Member            | Role                 |
| ----------------- | -------------------- |
| Rameshwar Dubey   | Full-Stack Developer |
| Sumit Shukla      | Full-Stack Developer |
| Raunak Chaturvedi | Full-Stack Developer |
| Anjali Saraswat   | Full-Stack Developer |

---

## 🎉 You're All Set!

You now have a fully functional AI Code Reviewer application!

**Start developing:**

1. Backend: `npm run dev` (in `backend/` folder)
2. Frontend: `npm run dev` (in `frontend/` folder)
3. Open: http://localhost:5173

Happy coding!
