# Setting Up OpenAI API Key for Auto Fix Feature

## Why Auto Fix isn't working:

The OpenAI API key in `backend/.env` is set to a **placeholder value** (`sk-proj-demo-key-placeholder`), which is not a real key. This prevents the Auto Fix feature from working.

## Steps to Fix:

### 1. Get an OpenAI API Key

- Go to: https://platform.openai.com/api-keys
- Sign up or log in with your OpenAI account
- Click "Create new secret key"
- Copy the key (starts with `sk-proj-`)

### 2. Update backend/.env

Edit `backend/.env` and replace the placeholder:

```
# ❌ BEFORE (doesn't work)
OPENAI_API_KEY=sk-proj-demo-key-placeholder

# ✅ AFTER (your real key)
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3. Restart the Backend

The backend will automatically pick up the new API key:

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart it:
npm run dev
```

### 4. Test Auto Fix

- Go to http://localhost:5173
- Write some code with issues
- Click "Auto Fix" button
- The code should now be improved!

## If it still doesn't work:

1. Check browser console (F12) for error messages
2. Check backend terminal for "[FIX]" log messages
3. Verify the API key is actually set in `backend/.env`
4. Make sure you have OpenAI API credits available

## Cost Considerations:

- Each Auto Fix call uses OpenAI API and incurs a small cost
- Free trial API keys expire after 3 months
- Monitor your usage at https://platform.openai.com/account/usage/overview
