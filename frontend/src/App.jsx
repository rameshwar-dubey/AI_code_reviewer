import { useEffect, useMemo, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBarChart2,
  FiChevronRight,
  FiCode,
  FiCopy,
  FiCpu,
  FiExternalLink,
  FiFileText,
  FiGithub,
  FiLayers,
  FiMessageCircle,
  FiPlay,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiUpload,
  FiZap,
} from "react-icons/fi";
import {
  analyzeCode,
  analyzeRepository,
  healthCheck,
  pipelineChatWithCode,
  pipelineFixCode,
  saveQuestion,
} from "./utils/api";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

const languageOptions = [
  { value: "javascript", label: "JavaScript", monaco: "javascript" },
  { value: "typescript", label: "TypeScript", monaco: "typescript" },
  { value: "python", label: "Python", monaco: "python" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "cpp", label: "C++", monaco: "cpp" },
];

const sampleCodeByLanguage = {
  javascript: `const users = [
  { id: 1, name: "Ava", score: 78 },
  { id: 2, name: "Noah", score: 91 },
];

function getTopUser(items) {
  let winner = null;
  for (let i = 0; i < items.length; i++) {
    if (!winner || items[i].score > winner.score) {
      winner = items[i];
    }
  }
  return winner;
}

console.log(getTopUser(users));`,
  typescript: `type User = {
  id: number;
  name: string;
  score: number;
};

const users: User[] = [
  { id: 1, name: "Ava", score: 78 },
  { id: 2, name: "Noah", score: 91 },
];

export function getTopUser(items: User[]): User | null {
  return items.reduce<User | null>((winner, current) => {
    if (!winner || current.score > winner.score) {
      return current;
    }
    return winner;
  }, null);
}
`,
  python: `users = [
    {"id": 1, "name": "Ava", "score": 78},
    {"id": 2, "name": "Noah", "score": 91},
]

def get_top_user(items):
    winner = None
    for item in items:
        if winner is None or item["score"] > winner["score"]:
            winner = item
    return winner


print(get_top_user(users))`,
  java: `import java.util.List;

public class Reviewer {
  public static String findTopUser(List<User> users) {
    User winner = null;
    for (User user : users) {
      if (winner == null || user.score() > winner.score()) {
        winner = user;
      }
    }
    return winner == null ? "none" : winner.name();
  }
}

record User(int id, String name, int score) { }`,
  cpp: `#include <iostream>
#include <vector>

struct User {
  int id;
  const char* name;
  int score;
};

const User* getTopUser(const std::vector<User>& users) {
  const User* winner = nullptr;
  for (const auto& user : users) {
    if (!winner || user.score > winner->score) {
      winner = &user;
    }
  }
  return winner;
}

int main() {
  std::vector<User> users = {{1, "Ava", 78}, {2, "Noah", 91}};
  std::cout << getTopUser(users)->name << std::endl;
}
`,
};

const starterCode = sampleCodeByLanguage.javascript;

const quickQuestions = [
  "Find bugs and logic issues",
  "Improve performance hotspots",
  "Make this code more readable",
  "Generate a safer optimized version",
];

const sampleExtensions = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
};

function getLanguageMeta(language) {
  return (
    languageOptions.find((entry) => entry.value === language) ||
    languageOptions[0]
  );
}

function getMonacoLanguage(language) {
  return getLanguageMeta(language).monaco;
}

function getSampleCode(language) {
  return sampleCodeByLanguage[language] || starterCode;
}

function countLines(code) {
  return code ? code.split("\n").length : 0;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAnalysis(payload) {
  const data = payload?.data || payload || {};
  const review = data.ai_review || data.review || {};
  const summary = data.summary || {};
  const validation = payload?.validation || data.validation || null;
  const issuesFromValidation = safeArray(validation?.warnings).map(
    (warning, index) => ({
      rule: "validation",
      message: warning,
      severity: "warning",
      line: index + 1,
      column: 1,
    }),
  );
  const issues = safeArray(data.issues).length
    ? safeArray(data.issues)
    : safeArray(data.errors).length
      ? safeArray(data.errors)
      : issuesFromValidation;

  return {
    raw: data,
    issues,
    summary: {
      total_errors:
        summary.total_errors ?? data.total_errors ?? issues.length ?? 0,
      quality_score:
        summary.quality_score ?? data.quality_score ?? data.score ?? 0,
      risk_assessment:
        summary.risk_assessment ?? data.risk_assessment ?? "Unknown",
      recommendation: summary.recommendation ?? data.recommendation ?? "",
      ml_improvements: summary.ml_improvements ?? data.ml_improvements ?? 0,
    },
    ml: data.ml_analysis || {
      score: summary.quality_score ?? data.score ?? 0,
      risk_level: summary.risk_assessment ?? data.risk_level ?? "Unknown",
      features: data.features || {},
      errors_detected: issues.length,
      warnings: 0,
      error_score: 0,
    },
    review: {
      explanation: review.explanation || data.explanation || "",
      suggestions: safeArray(review.suggestions),
      optimized_code:
        review.optimized_code || data.corrected_code || data.fixedCode || "",
      confidence: review.confidence ?? data.confidence ?? null,
    },
    validation,
    error: payload?.error || data.error || null,
  };
}

function formatRiskTone(risk) {
  const normalized = String(risk || "").toLowerCase();
  if (normalized.includes("low")) return "emerald";
  if (normalized.includes("medium")) return "amber";
  return "rose";
}

function issueTone(severity) {
  const normalized = String(severity || "").toLowerCase();
  if (normalized.includes("critical") || normalized.includes("error")) {
    return "border-rose-500/40 bg-rose-500/10 text-rose-100";
  }
  if (normalized.includes("major") || normalized.includes("warning")) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-100";
  }
  return "border-cyan-500/30 bg-cyan-500/10 text-cyan-100";
}

function copyToClipboard(text) {
  if (!text) return Promise.resolve();
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("Clipboard is not available"));
}

function Panel({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <motion.section
      className={`studio-panel ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="studio-panel__header">
        <div>
          <div className="studio-panel__title-row">
            {Icon ? <Icon className="text-cyan-300" size={18} /> : null}
            <h2 className="studio-panel__title">{title}</h2>
          </div>
          {subtitle ? (
            <p className="studio-panel__subtitle">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function MetricCard({ label, value, accent = "cyan", hint }) {
  return (
    <div className="metric-card">
      <p className="metric-card__label">{label}</p>
      <div className="metric-card__value-wrap">
        <span className={`metric-card__value metric-card__value--${accent}`}>
          {value}
        </span>
      </div>
      {hint ? <p className="metric-card__hint">{hint}</p> : null}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`tab-pill ${active ? "tab-pill--active" : ""}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

function ChatBubble({ role, text, meta }) {
  const isUser = role === "user";
  return (
    <div
      className={`chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--assistant"}`}
    >
      <div className="chat-bubble__meta">
        {isUser ? "You" : "Copilot Studio"}
      </div>
      <p className="chat-bubble__text">{text}</p>
      {meta ? (
        <p className="chat-bubble__meta chat-bubble__meta--bottom">{meta}</p>
      ) : null}
    </div>
  );
}

function RepoFileCard({ file, index }) {
  return (
    <motion.div
      className="repo-file-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="repo-file-card__top">
        <div>
          <p className="repo-file-card__name">
            {file.name || file.path || `File ${index + 1}`}
          </p>
          <p className="repo-file-card__meta">
            {file.language || "Unknown"}{" "}
            {file.linesOfCode ? `• ${file.linesOfCode} lines` : ""}
          </p>
        </div>
        <span className="repo-file-card__badge">
          {safeArray(file.issues).length} issues
        </span>
      </div>

      {safeArray(file.issues).length > 0 ? (
        <div className="mt-3 space-y-2">
          {safeArray(file.issues)
            .slice(0, 3)
            .map((issue, issueIndex) => (
              <p key={issueIndex} className="repo-file-card__issue">
                Line {issue.line || issueIndex + 1}:{" "}
                {issue.message || issue.description || "Issue detected"}
              </p>
            ))}
          {safeArray(file.issues).length > 3 ? (
            <p className="repo-file-card__more">
              +{safeArray(file.issues).length - 3} more issues
            </p>
          ) : null}
        </div>
      ) : (
        <p className="repo-file-card__issue mt-3">
          No major issues surfaced in this file.
        </p>
      )}
    </motion.div>
  );
}

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRepoAnalyzerOpen, setIsRepoAnalyzerOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [code, setCode] = useState(getSampleCode("javascript"));
  const [fileName, setFileName] = useState("starter.js");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notice, setNotice] = useState("Ready to analyze your code.");
  const [backendReady, setBackendReady] = useState(false);
  const [copyState, setCopyState] = useState("");

  const [repoUrl, setRepoUrl] = useState("");
  const [repoResult, setRepoResult] = useState(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState("");

  const [chatInput, setChatInput] = useState("What should I fix first?");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Drop in code, run an analysis, and ask follow-up questions in the chat panel.",
    },
  ]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const meta = getLanguageMeta(language);
  const lineCount = countLines(code);
  const charCount = code.length;
  const score = Math.round(
    analysis?.summary?.quality_score ?? analysis?.ml?.score ?? 0,
  );
  const issueCount =
    analysis?.summary?.total_errors ?? analysis?.issues?.length ?? 0;
  const riskLevel =
    analysis?.summary?.risk_assessment ?? analysis?.ml?.risk_level ?? "Unknown";
  const confidence =
    analysis?.review?.confidence ?? analysis?.ml?.confidence ?? null;
  const riskTone = formatRiskTone(riskLevel);

  useEffect(() => {
    let mounted = true;
    healthCheck()
      .then(() => {
        if (mounted) setBackendReady(true);
      })
      .catch(() => {
        if (mounted) setBackendReady(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const summaryBlurb = useMemo(() => {
    if (!analysis) {
      return "Run a scan to see quality score, risk level, and AI recommendations in one place.";
    }

    if (analysis.error) {
      return analysis.error;
    }

    if (analysis.validation) {
      return (
        analysis.validation.suggestions?.[0] ||
        "Input validation needs attention."
      );
    }

    return (
      analysis.summary?.recommendation ||
      analysis.review?.explanation ||
      "Analysis complete."
    );
  }, [analysis]);

  const handleLoadSample = (nextLanguage = language) => {
    const targetLanguage = nextLanguage || language;
    setLanguage(targetLanguage);
    setCode(getSampleCode(targetLanguage));
    setFileName(`sample.${sampleExtensions[targetLanguage] || "txt"}`);
    setAnalysis(null);
    setNotice("Sample code loaded. Run analysis to generate fresh results.");
    setActiveTab("overview");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "js";
    const matchedLanguage =
      languageOptions.find(
        (option) => option.value === extension || option.monaco === extension,
      ) ||
      (extension === "jsx" ? languageOptions[0] : null) ||
      languageOptions[0];

    setLanguage(matchedLanguage.value);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const content = String(readerEvent.target?.result || "");
      setCode(content);
      setAnalysis(null);
      setNotice(
        `Loaded ${file.name}. You can analyze or ask the assistant to review it.`,
      );
      setActiveTab("overview");
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setAnalysis({
        validation: {
          suggestions: ["Paste or upload code before running analysis."],
          warnings: ["No code detected."],
        },
      });
      setNotice("Code is required to run the analysis.");
      setActiveTab("issues");
      return;
    }

    setLoading(true);
    setNotice("Running the pipeline: lint, AST, ML, and AI review...");
    setActiveTab("overview");

    try {
      const response = await analyzeCode(code, language);
      if (response?.status === 400) {
        const normalized = normalizeAnalysis(response);
        setAnalysis(normalized);
        setNotice(
          normalized.validation?.warnings?.[0] || "Input validation failed.",
        );
        setActiveTab("issues");
        return;
      }

      const normalized = normalizeAnalysis(response);
      setAnalysis(normalized);
      setNotice(
        normalized.summary?.recommendation ||
          "Analysis completed successfully.",
      );

      const assistantNote = `Quality score ${normalized.summary.quality_score}/100 with ${normalized.summary.total_errors} issues and ${normalized.summary.risk_assessment} risk.`;
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: assistantNote,
          meta: normalized.review.explanation || "Pipeline summary",
        },
      ]);
    } catch (error) {
      setAnalysis({ error: error.message });
      setNotice(error.message || "Analysis failed.");
      setActiveTab("overview");
    } finally {
      setLoading(false);
    }
  };

  const handleFixCode = async () => {
    if (!code.trim()) return;

    setFixLoading(true);
    setNotice("Generating an optimized version of the current code...");

    try {
      const response = await pipelineFixCode(
        code,
        language,
        analysis?.issues || [],
      );
      const fixedCode =
        response?.corrected_code ||
        response?.fixedCode ||
        response?.optimized_code ||
        response?.data?.corrected_code ||
        response?.data?.fixedCode ||
        response?.data?.optimized_code ||
        "";

      if (fixedCode) {
        setCode(fixedCode);
        setNotice("Optimized code applied to the editor.");
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "I generated an optimized version and loaded it into the editor.",
          },
        ]);
      } else {
        setNotice("The optimizer returned no code block to apply.");
      }

      const normalized = normalizeAnalysis(response);
      setAnalysis((prev) =>
        prev
          ? {
              ...prev,
              review: {
                ...prev.review,
                optimized_code: fixedCode || prev.review.optimized_code,
              },
            }
          : normalized,
      );
      setActiveTab("review");
    } catch (error) {
      setNotice(error.message || "Failed to generate a fix.");
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error.message || "The fix request failed.",
        },
      ]);
    } finally {
      setFixLoading(false);
    }
  };

  const handleAskQuestion = async (question = chatInput) => {
    if (!question.trim()) return;

    const userText = question.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "Thinking about that in the context of your code...",
      },
    ]);

    try {
      const response = await pipelineChatWithCode(code, userText, language);
      const answer =
        response?.answer ||
        response?.message ||
        response?.response ||
        response?.data?.answer ||
        response?.data?.message ||
        response?.data?.response ||
        "I could not generate a response for that question.";

      setChatMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", text: answer };
        return next;
      });

      await saveQuestion(userText, code, language);
    } catch (error) {
      setChatMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          text: error.message || "The chat request failed.",
        };
        return next;
      });
    }
  };

  const handleRepoAnalyze = async () => {
    if (!repoUrl.trim()) {
      setRepoError("Paste a GitHub repository URL first.");
      return;
    }

    setRepoLoading(true);
    setRepoError("");
    setNotice("Scanning the repository for structure and code issues...");

    try {
      const response = await analyzeRepository(repoUrl.trim());
      setRepoResult(response);
      setActiveTab("repo");
      setNotice("Repository analysis complete.");
    } catch (error) {
      setRepoResult(null);
      setRepoError(
        error.response?.data?.error ||
          error.message ||
          "Repository analysis failed.",
      );
      setNotice("Repository analysis failed.");
    } finally {
      setRepoLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await copyToClipboard(code);
      setCopyState("Copied to clipboard");
      setTimeout(() => setCopyState(""), 1800);
    } catch {
      setCopyState("Clipboard unavailable");
      setTimeout(() => setCopyState(""), 1800);
    }
  };

  const activeIssues = safeArray(analysis?.issues);

  return (
    <div className="flex h-screen bg-[var(--bg-0)] text-[var(--text-main)] font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        conversations={conversations}
        currentId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <div className="flex flex-col flex-1 h-screen">
        <Navbar
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenRepoAnalyzer={() => setIsRepoAnalyzerOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              {/* Code Editor and Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[var(--surface)] rounded-2xl shadow-lg flex flex-col"
              >
                <div className="p-4 border-b border-[var(--line-soft)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiCode className="text-teal-300" />
                    <h2 className="font-semibold">Code Input</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        setCode(sampleCodeByLanguage[e.target.value]);
                      }}
                      className="bg-transparent text-sm p-1 rounded"
                    >
                      {languageOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleFileUpload}
                      className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                      title="Upload file"
                    >
                      <FiUpload size={16} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="h-96">
                  <MonacoEditor
                    height="100%"
                    language={
                      languageOptions.find((l) => l.value === language)
                        ?.monaco || "javascript"
                    }
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
                <div className="p-3 border-t border-[var(--line-soft)] flex items-center justify-end">
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <FiCpu />
                        </motion.div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <FiPlay />
                        <span>Analyze Code</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Analysis Output */}
              <AnimatePresence>
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[var(--surface)] rounded-2xl shadow-lg flex flex-col"
                  >
                    <div className="p-4 border-b border-[var(--line-soft)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiBarChart2 className="text-amber-300" />
                        <h2 className="font-semibold">Analysis Result</h2>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(JSON.stringify(analysis, null, 2))
                        }
                        className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                        title="Copy JSON"
                      >
                        <FiCopy size={16} />
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Metrics */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                          <FiZap /> Code Metrics
                        </h3>
                        <p>
                          <strong>Complexity:</strong>{" "}
                          <span className="font-mono bg-[var(--bg-1)] px-2 py-1 rounded">
                            {analysis.metrics?.complexity}
                          </span>
                        </p>
                        <p>
                          <strong>Lines of Code:</strong>{" "}
                          <span className="font-mono bg-[var(--bg-1)] px-2 py-1 rounded">
                            {analysis.metrics?.loc}
                          </span>
                        </p>
                      </div>

                      {/* Linting */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                          <FiShield /> Linting Issues
                        </h3>
                        {analysis.linting?.length > 0 ? (
                          <ul className="space-y-2">
                            {analysis.linting.map((issue, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">●</span>
                                <div>
                                  <p className="font-semibold">
                                    {issue.message}
                                  </p>
                                  <p className="text-xs text-[var(--text-muted)]">
                                    Line {issue.line}, Column {issue.column} (
                                    {issue.ruleId})
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-green-400">No issues found!</p>
                        )}
                      </div>

                      {/* AST */}
                      <div className="md:col-span-2 space-y-3">
                        <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                          <FiLayers /> AST Explorer
                        </h3>
                        <div className="h-48 bg-[var(--bg-1)] rounded-lg p-2 overflow-auto">
                          <pre className="text-xs">
                            <code>{JSON.stringify(analysis.ast, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat Panel */}
            <div className="w-[450px] border-l border-[var(--line-soft)] flex flex-col h-full">
              <div className="p-4 border-b border-[var(--line-soft)]">
                <h2 className="font-semibold flex items-center gap-2">
                  <FiMessageCircle className="text-cyan-300" />
                  AI Assistant
                </h2>
              </div>
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto"
              >
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-[var(--surface-elevated)] rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-3 rounded-2xl bg-[var(--surface-elevated)] rounded-bl-none">
                      <div className="flex items-center gap-2 text-sm">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <FiCpu />
                        </motion.div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[var(--line-soft)]">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Ask about the code..."
                    className="w-full bg-[var(--bg-1)] rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-500 text-slate-900 rounded-lg disabled:opacity-50"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Repo Analyzer Modal */}
      <AnimatePresence>
        {isRepoAnalyzerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsRepoAnalyzerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--surface-elevated)] w-full max-w-2xl rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[var(--line-soft)]">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FiGithub className="text-teal-300" />
                  Analyze GitHub Repository
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full bg-[var(--bg-1)] rounded-xl p-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <FiExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>
                <motion.button
                  onClick={handleRepoAnalysis}
                  disabled={isRepoLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 font-semibold rounded-lg shadow-md disabled:opacity-50"
                  whileHover={{ scale: isRepoLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isRepoLoading ? 1 : 0.98 }}
                >
                  {isRepoLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <FiCpu />
                      </motion.div>
                      <span>Analyzing Repository...</span>
                    </>
                  ) : (
                    <>
                      <FiSearch />
                      <span>Start Analysis</span>
                    </>
                  )}
                </motion.button>
              </div>
              {repoAnalysisResult && (
                <div className="p-6 border-t border-[var(--line-soft)]">
                  <h3 className="font-bold mb-2">Analysis Complete:</h3>
                  <div className="h-64 bg-[var(--bg-1)] rounded-lg p-2 overflow-auto">
                    <pre className="text-xs">
                      <code>{JSON.stringify(repoAnalysisResult, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
