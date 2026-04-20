/**
 * Server - Express app setup and configuration
 * Restart trigger: v2
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============ Middleware ============

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"] // Replace with your frontend domain
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
          ],
    credentials: true,
  }),
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ Routes ============

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "AI Code Reviewer API",
    version: "1.0.0",
    team: "Tech Titans",
    members: [
      "Rameshwar Dubey",
      "Sumit Shukla",
      "Raunak Chaturvedi",
      "Anjali Saraswat",
    ],
    endpoints: {
      health: "GET /health",
      analyze: "POST /api/analyze",
      review: "POST /api/review",
      fix: "POST /api/fix",
      analyzeRepo: "POST /api/analyze-repo",
      security: "POST /api/security",
    },
  });
});

// API routes
app.use("/api/chat", chatRoutes); // More specific routes first!
app.use("/api", analyzeRoutes);
app.use("/api/questions", questionRoutes);

// ============ Error Handling ============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============ Start Server ============

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          AI CODE REVIEWER - BACKEND SERVER STARTED             ║
╠════════════════════════════════════════════════════════════════╣
║ Server running on: http://localhost:${PORT}
║ Environment: ${process.env.NODE_ENV || "development"}
║ OpenAI API: ${process.env.OPENAI_API_KEY ? "✓ Configured" : "✗ Not configured"}
║ GitHub Token: ${process.env.GITHUB_TOKEN ? "✓ Configured" : "✗ Not configured"}
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
