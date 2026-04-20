# API Integration Guide

## OpenAI API Setup

### Step 1: Create OpenAI Account

1. Visit https://platform.openai.com
2. Sign up or log in with existing account
3. Verify email address

### Step 2: Get API Key

1. Navigate to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key (you won't be able to see it again)
4. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Set Up Billing

1. Go to https://platform.openai.com/account/billing/overview
2. Add a payment method
3. Set usage limits if desired
4. Monitor usage in the dashboard

### Supported Models

- `claude-3-5-sonnet-20241022` (Recommended - best balance)
- `claude-3-opus-20240229` (More powerful)
- `claude-3-haiku-20240307` (Faster, cheaper)

To change model, edit `backend/services/aiService.js`:

```javascript
const message = await client.messages.create({
  model: 'claude-3-opus-20240229',  // Change this
  max_tokens: 1024,
  messages: [...]
});
```

### Cost Estimation

| Model  | Input      | Output   |
| ------ | ---------- | -------- |
| Haiku  | $0.80/MTok | $4/MTok  |
| Sonnet | $3/MTok    | $15/MTok |
| Opus   | $15/MTok   | $75/MTok |

_MTok = Million tokens (approx. 750,000 words)_

---

## GitHub API Setup

### Step 1: Create Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "AI Code Reviewer"
4. Select scopes:
   - `repo` (full control of private repositories)
   - `read:user` (read user profile)
5. Generate and copy token
6. Add to `backend/.env`:
   ```
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 2: Using GitHub API

- **Public repos:** Works without token (60 requests/hour)
- **Private repos:** Requires token (5000 requests/hour)
- **Rate limits:** Check remaining with API responses

### Common Issues

**401 Unauthorized:**

- Token has expired
- Token permissions insufficient
- Token not included in request header

**403 Forbidden:**

- Rate limit exceeded
- Insufficient permissions

**404 Not Found:**

- Repository doesn't exist
- Repository is private (without valid token)

---

## Environment Variables Reference

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# OpenAI API
OPENAI_API_KEY=sk-xxxx...

# GitHub (Optional)
GITHUB_TOKEN=ghp_xxxx...

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend

No .env file needed! Frontend uses relative API URLs through Vite proxy.
Vite config in `frontend/vite.config.js` handles proxying.

---

## Docker Deployment (Optional)

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t ai-code-reviewer-backend .
docker run -e OPENAI_API_KEY=sk-xxx -p 5000:5000 ai-code-reviewer-backend
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t ai-code-reviewer-frontend .
docker run -p 80:80 ai-code-reviewer-frontend
```

---

## Troubleshooting Guide

### Backend Issues

**Problem:** `Error: OPENAI_API_KEY is not set`
**Solution:**

- Check `.env` file exists
- Verify API key is correctly copied
- Ensure no spaces in key

**Problem:** `ESLint initialization failed`
**Solution:**

- Reinstall ESLint: `npm install eslint --save-dev`
- Clear cache: `rm -rf node_modules && npm install`

**Problem:** `Port 5000 already in use`
**Solution:**

- Kill process: `lsof -ti:5000 | xargs kill -9`
- Or use different port: `PORT=5001 npm run dev`

### Frontend Issues

**Problem:** `Cannot find module '@monaco-editor/react'`
**Solution:**

- Reinstall: `npm install @monaco-editor/react`
- Clear cache: `rm -rf node_modules && npm install`

**Problem:** `Tailwind CSS not working`
**Solution:**

- Rebuild: `npm run build`
- Check `tailwind.config.js` content paths
- Restart dev server

**Problem:** `CORS error`
**Solution:**

- Backend must be running on port 5000
- Check backend CORS config in `server.js`
- Verify frontend proxy in `vite.config.js`

### API Issues

**Problem:** `502 Bad Gateway`
**Solution:**

- Check backend is running
- Check for errors in backend console
- Verify API endpoint is correct

**Problem:** `504 Gateway Timeout`
**Solution:**

- Increase timeout in axios
- Check backend processing time
- For large code, reduce size

**Problem:** `429 Too Many Requests`
**Solution:**

- Implement request throttling
- Check rate limits
- Add delay between requests

---

## Performance Optimization

### Backend Optimization

```javascript
// Add caching for repeated analyses
const cache = new Map();

export const analyzeCode = async (code, language) => {
  const key = `${code.hash()}-${language}`;
  if (cache.has(key)) return cache.get(key);

  const result = await performAnalysis(code, language);
  cache.set(key, result);
  return result;
};
```

### Frontend Optimization

```javascript
// Lazy load components
const CodeEditor = lazy(() => import("./CodeEditor"));
const OutputPanel = lazy(() => import("./OutputPanel"));

// Memoize expensive computations
const memoizedAnalysis = useMemo(
  () => analyzeCode(code, language),
  [code, language],
);
```

---

## Security Best Practices

1. **Never commit API keys** - Use `.env` and `.gitignore`
2. **Rotate tokens regularly** - GitHub tokens should be rotated monthly
3. **Use HTTPS in production** - Always use HTTPS for API calls
4. **Validate input** - Sanitize code before sending to API
5. **Rate limiting** - Implement rate limiting on backend
6. **CORS** - Configure CORS to allow only trusted origins
7. **Environment variables** - Store secrets in environment variables
8. **Dependencies** - Keep dependencies updated with `npm audit fix`

---

## Monitoring & Logging

### Backend Logging

```javascript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

logger.info("Code analysis started");
```

### Frontend Logging

```javascript
// Use browser console in development
console.log("Analysis result:", response);
console.error("API error:", error);

// Send to logging service in production
Sentry.captureException(error);
```

---

## Useful Commands

```bash
# Backend
npm install              # Install dependencies
npm run dev             # Start development server
npm start               # Start production server
npm test                # Run tests (if configured)

# Frontend
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Cleanup
rm -rf node_modules     # Remove dependencies
rm package-lock.json    # Remove lock file
npm cache clean --force # Clear npm cache
```

---

## Next Steps

1. ✅ Install Node.js and npm
2. ✅ Get API keys (OpenAI, GitHub optional)
3. ✅ Set up environment variables
4. ✅ Install dependencies
5. ✅ Start backend and frontend servers
6. ✅ Open browser and test application
7. ✅ Customize configuration as needed

For more help, see README.md or check specific component documentation!
