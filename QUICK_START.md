# Quick Start - 5 Minutes

## The Fastest Way to Get Running

### Prerequisites ✓

- Node.js 16+ ([Download](https://nodejs.org/))
- OpenAI API Key ([Get free key](https://platform.openai.com/api-keys))

---

## Step 1: Run Setup Script (1 minute)

**Windows:**

```bash
setup.bat
```

**Mac/Linux:**

```bash
bash setup.sh
```

This automatically installs all dependencies for both frontend and backend.

---

## Step 2: Configure API Key (2 minutes)

1. Open `backend/.env`
2. Find: `OPENAI_API_KEY=your_openai_api_key_here`
3. Get your key from: https://platform.openai.com/api-keys
4. Paste your key
5. Save file

Example:

```env
PORT=5000
OPENAI_API_KEY=sk-proj-abc123xyz...
```

---

## Step 3: Start Servers (2 minutes)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

You should see:

```
╔════════════════════════════════════════════════════════════════╗
║          AI CODE REVIEWER - BACKEND SERVER STARTED             ║
║ Server running on: http://localhost:5000                       ║
║ OpenAI API: ✓ Configured                                       ║
╚════════════════════════════════════════════════════════════════╝
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

You should see:

```
  ➜  Local:   http://localhost:5173/
```

---

## Step 4: Open Browser (30 seconds)

Go to: **http://localhost:5173**

You're done! 🎉

---

## Start Using It

1. **Paste Code** → Paste JavaScript/Python code into the editor
2. **See Issues** → Issues appear automatically on the right
3. **Get AI Review** → Click "AI Review" button
4. **Auto Fix** → Click "Auto Fix" to improve code
5. **GitHub Analysis** → Click GitHub button to analyze repos

---

## 📚 Detailed Documentation

- **README.md** - Complete project documentation
- **CONFIGURATION.md** - API setup and troubleshooting
- **backend/README.md** - Backend architecture
- **frontend/README.md** - Frontend components

---

## ❓ Common Issues

### "Cannot connect to backend"

```bash
# Check if backend is running
curl http://localhost:5000

# If not, start it:
cd backend && npm run dev
```

### "OpenAI API not working"

1. Check API key in `backend/.env`
2. Verify key from https://platform.openai.com/account/api-keys
3. Ensure account has credits

### "Port already in use"

```bash
# Use different port
PORT=5001 npm run dev  # backend
PORT=5174 npm run dev  # frontend
```

---

## 🎮 Features Overview

| Feature            | Usage                                     |
| ------------------ | ----------------------------------------- |
| Real-time Linting  | Type code, see issues instantly           |
| AI Review          | Click "AI Review" button                  |
| Auto Fix           | Click "Auto Fix" button                   |
| Security Scan      | Click "Security" tab                      |
| GitHub Analysis    | Click GitHub icon, paste repo URL         |
| Multiple Languages | JavaScript, Python, TypeScript, Java, C++ |
| 🌙 Dark Theme      | Beautiful glassmorphism design            |

---

## 🔗 Useful Links

- OpenAI API Dashboard: https://platform.openai.com/account/api-keys
- GitHub Tokens: https://github.com/settings/tokens
- React Docs: https://react.dev
- Monaco Editor: https://microsoft.github.io/monaco-editor/

---

## 📞 Need Help?

1. Check **CONFIGURATION.md** for detailed setup
2. Review **README.md** for full documentation
3. Check backend terminal for error messages
4. Look for API errors in browser console (F12)

---

## 🎉 That's It!

You now have a professional AI Code Reviewer running locally!

### Next Steps:

- Customize rules in `backend/services/ruleEngine.js`
- Add new languages in `backend/services/lintService.js`
- Modify UI in `frontend/src/components/`
- Deploy to cloud (Vercel, Heroku, etc.)

**Happy coding!**
