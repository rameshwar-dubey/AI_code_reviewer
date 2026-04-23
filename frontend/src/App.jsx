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

export default function App() {
  const [language, setLanguage] = useState("javascript");
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
    <div className="app-shell">
      <div className="app-shell__bg app-shell__bg--one" />
      <div className="app-shell__bg app-shell__bg--two" />
      <div className="app-shell__grid" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 pt-5 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="brand-mark">
            <FiCode size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
              AI Code Reviewer Studio
            </h1>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Visual code review workspace
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span
            className={`status-pill ${backendReady ? "status-pill--good" : "status-pill--bad"}`}
          >
            <span className="status-dot" />
            {backendReady ? "Backend connected" : "Backend offline"}
          </span>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setActiveTab("chat")}
          >
            <FiMessageCircle size={16} />
            Chat
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setActiveTab("repo")}
          >
            <FiGithub size={16} />
            Repo analyzer
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 md:px-6 lg:px-8">
        <section className="hero-panel">
          <div className="hero-panel__copy">
            <span className="eyebrow">
              <FiZap size={14} />
              Modern review workspace
            </span>
            <h2 className="hero-panel__title">
              Turn raw code into a polished, readable, and safer result.
            </h2>
            <p className="hero-panel__description">
              Upload a file, paste a snippet, or load a sample. The studio runs
              the full pipeline, highlights issues, and gives you an optimized
              edit path with a cleaner visual experience.
            </p>

            <div className="hero-panel__chips">
              <span className="feature-chip">
                <FiBarChart2 size={14} /> ML score
              </span>
              <span className="feature-chip">
                <FiShield size={14} /> Risk analysis
              </span>
              <span className="feature-chip">
                <FiCpu size={14} /> AI review
              </span>
              <span className="feature-chip">
                <FiLayers size={14} /> Repo scan
              </span>
            </div>
          </div>

          <div className="hero-panel__metrics">
            <MetricCard
              label="Quality Score"
              value={score ? `${score}/100` : "—"}
              accent={score >= 80 ? "emerald" : score >= 60 ? "amber" : "rose"}
              hint="ML-based quality estimate"
            />
            <MetricCard
              label="Issues Found"
              value={analysis ? issueCount : "—"}
              accent="cyan"
              hint="Lint, structural, and AI-detected issues"
            />
            <MetricCard
              label="Risk"
              value={riskLevel}
              accent={riskTone}
              hint={analysis?.summary?.recommendation || "Awaiting analysis"}
            />
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Panel
              title="Code Studio"
              subtitle="Edit, upload, and run analysis from the same canvas."
              icon={FiFileText}
            >
              <div className="studio-toolbar">
                <div className="studio-toolbar__left">
                  <label className="select-shell">
                    <span>Language</span>
                    <select
                      value={language}
                      onChange={(event) => {
                        const nextLanguage = event.target.value;
                        setLanguage(nextLanguage);
                        setNotice(
                          `Language set to ${getLanguageMeta(nextLanguage).label}.`,
                        );
                      }}
                    >
                      {languageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <span className="meta-chip">
                    <FiFileText size={14} />
                    {fileName}
                  </span>
                  <span className="meta-chip">
                    <FiCode size={14} />
                    {lineCount} lines
                  </span>
                  <span className="meta-chip">
                    <FiBarChart2 size={14} />
                    {charCount} chars
                  </span>
                </div>

                <div className="studio-toolbar__right">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handleLoadSample(language)}
                  >
                    Load sample
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiUpload size={16} />
                    Upload
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={handleCopyCode}
                  >
                    <FiCopy size={16} />
                    Copy
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cc,.hpp,.h"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="editor-shell">
                <MonacoEditor
                  height="100%"
                  language={getMonacoLanguage(language)}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 18, bottom: 18 },
                    fontFamily:
                      '"SFMono-Regular", "Cascadia Code", "Consolas", "Liberation Mono", monospace',
                    cursorSmoothCaretAnimation: "on",
                  }}
                />
              </div>

              <div className="studio-footer">
                <div className="studio-footer__status">
                  <span className="status-chip">
                    <span className="status-chip__dot" />
                    {notice}
                  </span>
                  {copyState ? (
                    <span className="status-chip status-chip--muted">
                      {copyState}
                    </span>
                  ) : null}
                </div>

                <div className="studio-footer__actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleFixCode}
                    disabled={fixLoading}
                  >
                    {fixLoading ? (
                      <FiRefreshCw className="spin-icon" size={16} />
                    ) : (
                      <FiZap size={16} />
                    )}
                    {fixLoading ? "Fixing" : "Auto fix"}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <FiRefreshCw className="spin-icon" size={16} />
                    ) : (
                      <FiPlay size={16} />
                    )}
                    {loading ? "Analyzing" : "Run analysis"}
                  </button>
                </div>
              </div>
            </Panel>

            <Panel
              title="Session Insight"
              subtitle="Quick visual summary of the active editor context."
              icon={FiShield}
              className="overflow-hidden"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-tile">
                  <p className="glass-tile__label">Language</p>
                  <p className="glass-tile__value">{meta.label}</p>
                </div>
                <div className="glass-tile">
                  <p className="glass-tile__label">Backend</p>
                  <p className="glass-tile__value">
                    {backendReady ? "Connected" : "Offline"}
                  </p>
                </div>
                <div className="glass-tile">
                  <p className="glass-tile__label">Workspace</p>
                  <p className="glass-tile__value">Review studio</p>
                </div>
              </div>
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {summaryBlurb}
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel
              title="Results Console"
              subtitle="One place for overview, issues, AI output, chat, and repository scans."
              icon={FiBarChart2}
            >
              <div className="flex flex-wrap gap-2 border-b border-white/10 px-1 pb-4">
                <TabButton
                  active={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </TabButton>
                <TabButton
                  active={activeTab === "issues"}
                  onClick={() => setActiveTab("issues")}
                >
                  Issues {analysis ? `(${activeIssues.length})` : ""}
                </TabButton>
                <TabButton
                  active={activeTab === "review"}
                  onClick={() => setActiveTab("review")}
                >
                  AI review
                </TabButton>
                <TabButton
                  active={activeTab === "chat"}
                  onClick={() => setActiveTab("chat")}
                >
                  Chat
                </TabButton>
                <TabButton
                  active={activeTab === "repo"}
                  onClick={() => setActiveTab("repo")}
                >
                  Repo scan
                </TabButton>
              </div>

              <div className="pt-5">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" ? (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      {analysis?.error ? (
                        <div className="rounded-[1.25rem] border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                          {analysis.error}
                        </div>
                      ) : null}

                      {analysis?.validation ? (
                        <div className="rounded-[1.25rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-50">
                          <p className="font-semibold">Validation feedback</p>
                          <ul className="mt-2 space-y-1 text-sm">
                            {safeArray(analysis.validation.warnings).map(
                              (warning, index) => (
                                <li key={index}>• {warning}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      ) : null}

                      {!analysis ? (
                        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                          <div className="flex items-center gap-2 text-slate-100">
                            <FiCpu size={18} className="text-cyan-300" />
                            <span className="font-semibold">
                              No analysis yet
                            </span>
                          </div>
                          <p className="mt-3 leading-7 text-slate-300">
                            Run the pipeline to get a quality score, risk
                            assessment, issue list, AI recommendations, and a
                            corrected code path.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                              Recommendation
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-200">
                              {analysis.summary?.recommendation ||
                                "No recommendation returned."}
                            </p>
                          </div>
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                              AI confidence
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-white">
                              {confidence !== null && confidence !== undefined
                                ? `${confidence}`
                                : "—"}
                            </p>
                            <p className="text-sm text-slate-400">
                              Confidence returned by the pipeline
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <MetricCard
                          label="ML Score"
                          value={analysis ? `${score}/100` : "—"}
                          accent={
                            score >= 80
                              ? "emerald"
                              : score >= 60
                                ? "amber"
                                : "rose"
                          }
                          hint="Higher is better"
                        />
                        <MetricCard
                          label="Risk Level"
                          value={riskLevel}
                          accent={riskTone}
                          hint="Auto-generated risk assessment"
                        />
                        <MetricCard
                          label="Issues"
                          value={analysis ? activeIssues.length : "—"}
                          accent="cyan"
                          hint="Merged lint, AST, and AI results"
                        />
                        <MetricCard
                          label="Lines"
                          value={lineCount}
                          accent="emerald"
                          hint="Editor line count"
                        />
                      </div>
                    </motion.div>
                  ) : null}

                  {activeTab === "issues" ? (
                    <motion.div
                      key="issues"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-3"
                    >
                      {!analysis ? (
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                          No issues to display yet. Run analysis to surface
                          lint, structural, and AI-detected findings.
                        </div>
                      ) : activeIssues.length === 0 ? (
                        <div className="rounded-[1.25rem] border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-50">
                          No issues surfaced in this run.
                        </div>
                      ) : (
                        activeIssues.map((issue, index) => (
                          <div
                            key={`${issue.line || index}-${index}`}
                            className={`rounded-[1.2rem] border p-4 ${issueTone(issue.severity || issue.level)}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-white">
                                  {issue.rule || issue.type || "Issue"}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-200">
                                  {issue.message ||
                                    issue.description ||
                                    "The pipeline returned an issue without a message."}
                                </p>
                              </div>
                              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-200">
                                {issue.line ? `L${issue.line}` : "L?"}
                                {issue.column ? ` • C${issue.column}` : ""}
                              </span>
                            </div>
                            {issue.suggestion ? (
                              <p className="mt-3 text-sm text-cyan-100">
                                <span className="font-semibold">
                                  Suggestion:{" "}
                                </span>
                                {issue.suggestion}
                              </p>
                            ) : null}
                          </div>
                        ))
                      )}
                    </motion.div>
                  ) : null}

                  {activeTab === "review" ? (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      {!analysis ? (
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                          AI review will appear here after analysis.
                        </div>
                      ) : (
                        <>
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-200 leading-7">
                            {analysis.review.explanation ||
                              "No review explanation returned."}
                          </div>

                          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-sm font-semibold text-white">
                                AI suggestions
                              </h3>
                              {analysis.review.optimized_code ? (
                                <button
                                  type="button"
                                  className="ghost-button"
                                  onClick={handleCopyCode}
                                >
                                  <FiCopy size={16} />
                                  Copy current code
                                </button>
                              ) : null}
                            </div>
                            <ul className="mt-4 space-y-2 text-sm text-slate-300">
                              {safeArray(analysis.review.suggestions).length >
                              0 ? (
                                safeArray(analysis.review.suggestions).map(
                                  (suggestion, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-3"
                                    >
                                      <FiChevronRight
                                        className="mt-0.5 shrink-0 text-cyan-300"
                                        size={16}
                                      />
                                      <span>{suggestion}</span>
                                    </li>
                                  ),
                                )
                              ) : (
                                <li className="text-slate-400">
                                  No structured suggestions were returned.
                                </li>
                              )}
                            </ul>
                          </div>

                          <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                            <div className="flex items-center justify-between gap-3 pb-3">
                              <p className="text-sm font-semibold text-white">
                                Optimized code preview
                              </p>
                              {analysis.review.optimized_code ? (
                                <span className="text-xs text-slate-400">
                                  Editable output
                                </span>
                              ) : null}
                            </div>
                            <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap rounded-[1rem] border border-white/10 bg-slate-950/80 p-4 text-xs leading-6 text-slate-200">
                              {analysis.review.optimized_code ||
                                "No optimized code returned yet."}
                            </pre>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ) : null}

                  {activeTab === "chat" ? (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                        <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                          {chatMessages.map((message, index) => (
                            <ChatBubble
                              key={`${message.role}-${index}`}
                              role={message.role}
                              text={message.text}
                              meta={message.meta}
                            />
                          ))}
                          <div ref={chatEndRef} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {quickQuestions.map((question) => (
                            <button
                              key={question}
                              type="button"
                              className="quick-question"
                              onClick={() => handleAskQuestion(question)}
                            >
                              {question}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            value={chatInput}
                            onChange={(event) =>
                              setChatInput(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                handleAskQuestion();
                              }
                            }}
                            placeholder="Ask about bugs, readability, tests, or architecture..."
                            className="studio-input flex-1"
                          />
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => handleAskQuestion()}
                          >
                            <FiSend size={16} />
                            Send
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}

                  {activeTab === "repo" ? (
                    <motion.div
                      key="repo"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      <form
                        className="space-y-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleRepoAnalyze();
                        }}
                      >
                        <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">
                          GitHub repository URL
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            value={repoUrl}
                            onChange={(event) => setRepoUrl(event.target.value)}
                            placeholder="https://github.com/owner/repo"
                            className="studio-input flex-1"
                          />
                          <button
                            type="submit"
                            className="primary-button"
                            disabled={repoLoading}
                          >
                            {repoLoading ? (
                              <FiRefreshCw className="spin-icon" size={16} />
                            ) : (
                              <FiSearch size={16} />
                            )}
                            {repoLoading ? "Scanning" : "Analyze repo"}
                          </button>
                        </div>
                        {repoError ? (
                          <div className="rounded-[1rem] border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">
                            {repoError}
                          </div>
                        ) : null}
                      </form>

                      {!repoResult ? (
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                          Enter a GitHub repository URL to inspect files,
                          issues, and basic stats.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
                            <h3 className="text-sm font-semibold text-white">
                              {repoResult.repository?.owner || "Repository"}/
                              {repoResult.repository?.repo || "analysis"}
                            </h3>
                            <p className="mt-2 text-sm text-slate-300">
                              {repoResult.totalFilesAnalyzed || 0} files
                              analyzed
                            </p>
                            {repoResult.repository?.url ? (
                              <a
                                href={repoResult.repository.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-300"
                              >
                                Open repository <FiExternalLink size={14} />
                              </a>
                            ) : null}
                          </div>

                          <div className="space-y-3">
                            {safeArray(repoResult.files).length > 0 ? (
                              safeArray(repoResult.files).map((file, index) => (
                                <RepoFileCard
                                  key={`${file.name || file.path || index}-${index}`}
                                  file={file}
                                  index={index}
                                />
                              ))
                            ) : (
                              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                                No file-level results were returned.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </Panel>
          </div>
        </section>
      </main>
    </div>
  );
}
