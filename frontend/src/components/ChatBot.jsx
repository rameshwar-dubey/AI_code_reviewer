/**
 * ChatBot Component - Interactive code review chat interface
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiUpload,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { analyzeCode, pipelineChatWithCode, saveQuestion } from "../utils/api";
import Sidebar from "./Sidebar";

const ChatBot = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! 👋 I'm your AI Code Reviewer. You can:",
      details: [
        "• Upload a code file",
        "• Paste your code directly",
        "• I'll analyze it for errors, bugs, and improvements",
      ],
    },
  ]);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [codeAnalyzed, setCodeAnalyzed] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatSectionRef = useRef(null);
  const chatInputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to chat input when needed
  const scrollToChatInput = () => {
    chatSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to chat input when messages are updated
  useEffect(() => {
    if (codeAnalyzed && messages.length > 2) {
      setTimeout(() => scrollToChatInput(), 100);
    }
  }, [messages, codeAnalyzed]);

  // Save current conversation to sidebar
  const saveConversation = (title) => {
    if (!currentConvId && messages.length > 1) {
      const newId = Date.now() + Math.random();
      const newConversation = {
        id: newId,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        messages: messages,
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
      };
      setConversations([newConversation, ...conversations]);
      setCurrentConvId(newId);
    }
  };

  // Create new conversation
  const handleNewConversation = () => {
    // Save current conversation first
    if (messages.length > 1) {
      saveConversation();
    }
    // Reset chat
    setMessages([
      {
        id: 1,
        type: "bot",
        text: "Hello! 👋 I'm your AI Code Reviewer. Ready for a new session?",
        details: [
          "• Upload a code file",
          "• Paste your code directly",
          "• I'll analyze it for errors, bugs, and improvements",
        ],
      },
    ]);
    setCode("");
    setFileName("");
    setChatInput("");
    setCodeAnalyzed(false);
    setCurrentConvId(null);
    setSidebarOpen(false);
  };

  // Load conversation from sidebar
  const handleLoadConversation = (convId) => {
    const conversation = conversations.find((c) => c.id === convId);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConvId(convId);
      setCode("");
      setFileName("");
      setChatInput("");
      setCodeAnalyzed(false);
      setSidebarOpen(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = (convId) => {
    setConversations(conversations.filter((c) => c.id !== convId));
    if (currentConvId === convId) {
      handleNewConversation();
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Determine language from file extension
      const ext = file.name.split(".").pop();
      const languageMap = {
        js: "javascript",
        jsx: "javascript",
        py: "python",
        ts: "typescript",
        tsx: "typescript",
        java: "java",
        cpp: "cpp",
        c: "c",
        cs: "csharp",
      };
      setLanguage(languageMap[ext] || "javascript");

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setCode(content);
        setFileName(file.name);

        // Add message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "user",
            text: `📁 Uploaded: ${file.name}`,
            details: [
              `Language: ${languageMap[ext] || ext}`,
              `Size: ${file.size} bytes`,
            ],
          },
        ]);
      };
      reader.readAsText(file);
    }
  };

  // Handle code submission
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Please upload a file or paste code",
          details: ["You need to provide code to analyze"],
        },
      ]);
      return;
    }

    // Add user message
    const codePreview = code.split("\n").slice(0, 3).join("\n");
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: `Analyzing code (${language})`,
        code: codePreview + (code.split("\n").length > 3 ? "\n..." : ""),
      },
    ]);

    setLoading(true);

    try {
      console.log("📊 Calling analyzeCode pipeline...");
      const result = await analyzeCode(code, language);
      console.log("✅ Analysis complete:", result);

      // Check for validation errors
      if (result.status === 400 && result.validation) {
        const validation = result.validation;
        const errorMsg = result.error || "Invalid input provided";

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "⚠️ Input Validation Error",
            details: [
              `❌ ${errorMsg}`,
              "",
              "Warnings:",
              ...validation.warnings.map((w) => `  • ${w}`),
              "",
              "How to fix:",
              ...validation.suggestions.map((s) => `  • ${s}`),
            ],
          },
        ]);
        setLoading(false);
        return;
      }

      // Extract data from pipeline response
      const data = result.data || result;

      // Add bot response with full analysis
      setMessages((prev) => {
        const updated = [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "✅ Code Analysis Complete",
            review: {
              explanation:
                data.ai_review?.explanation ||
                "Analysis completed successfully",
              suggestions: data.ai_review?.suggestions || [],
              improvedCode: data.ai_review?.optimized_code || "",
            },
            analysis: {
              score: data.ml_analysis?.score,
              risk: data.ml_analysis?.risk_level,
              errors: data.summary?.total_errors,
            },
            ml_detection: {
              errors_found: data.ml_analysis?.errors_detected || 0,
              warnings_found: data.ml_analysis?.warnings || 0,
              error_details: data.errors?.ml_detected || [],
              ml_improvements: data.summary?.ml_improvements || 0,
            },
          },
        ];

        // Auto-save conversation
        setTimeout(() => {
          if (!currentConvId && updated.length > 1) {
            const newId = Date.now();
            const newConversation = {
              id: newId,
              title: `Chat ${new Date().toLocaleDateString()}`,
              messages: updated,
              timestamp: new Date().toISOString(),
              messageCount: updated.length,
            };
            setConversations((prev) => [newConversation, ...prev]);
            setCurrentConvId(newId);
          }
        }, 0);

        return updated;
      });

      // Enable chat mode
      setCodeAnalyzed(true);
    } catch (error) {
      console.error("❌ Analysis error:", error);

      // Check if error response contains validation info
      const errorData = error.response?.data || {};
      const errorMsg =
        errorData.error || error.message || "Failed to analyze code";

      if (errorData.validation) {
        const validation = errorData.validation;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "⚠️ Input Validation Error",
            details: [
              `❌ ${errorMsg}`,
              "",
              "Warnings:",
              ...validation.warnings.map((w) => `  • ${w}`),
              "",
              "How to fix:",
              ...validation.suggestions.map((s) => `  • ${s}`),
            ],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "❌ Error analyzing code",
            details: [
              errorMsg,
              "",
              "Make sure:",
              "• Backend is running on port 5000",
              "• ML Service is running on port 5001",
              "• OPENAI_API_KEY is configured",
            ],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle quality assessment - REMOVED (now part of automatic pipeline)

  // Handle chat message submission
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !code.trim()) {
      if (!code.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: "❌ Please analyze code first",
            details: ["Use the Review button to analyze code before chatting"],
          },
        ]);
      }
      return;
    }

    const userMessage = chatInput;

    // Add user chat message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: userMessage,
      },
    ]);

    // Clear chat input but keep it visible
    setChatInput("");
    // Don't collapse anymore - keep it visible for next question

    setLoading(true);

    try {
      console.log("💬 Sending chat message...");

      // Save question to database (fire and forget)
      saveQuestion(userMessage, code, language);

      const result = await pipelineChatWithCode(code, userMessage, language);
      console.log("✅ Chat response:", result);

      const response = result.data || result;

      // Add bot response - DO NOT auto-save on chat (only save on code analysis)
      setMessages((prev) => {
        return [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            text: response.response || "I couldn't process your question",
            details: response.code_context
              ? [
                  `Quality: ${response.code_context.quality_score}/100`,
                  `Risk: ${response.code_context.risk_level}`,
                  `Issues: ${response.code_context.issues_found}`,
                ]
              : [],
          },
        ];
      });
    } catch (error) {
      console.error("❌ Chat error:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to process message";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Error processing your message",
          details: [
            errorMsg,
            "",
            "Troubleshooting:",
            "• Check backend is running",
            "• Check OpenAI API key is set",
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleChatSubmit();
    }
  };

  // Handle textarea resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [code]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmitCode();
    }
  };

  return (
    <div className="flex-1 w-full flex relative rounded-2xl border border-[var(--line-soft)] bg-[var(--surface)] backdrop-blur-md overflow-hidden shadow-xl">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentId={currentConvId}
        onSelectConversation={handleLoadConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 mt-14 md:mt-0 md:p-5 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 rounded-bl-2xl rounded-tl-2xl rounded-tr-md shadow-[0_10px_25px_rgba(20,184,166,0.35)]"
                      : "bg-[var(--bg-1)] text-[var(--text-main)] border border-[var(--line-soft)] rounded-br-2xl rounded-tr-2xl rounded-tl-md"
                  } p-4 space-y-2`}
                >
                  {/* Main text */}
                  <p className="text-sm font-medium">{msg.text}</p>

                  {/* Details/Metadata */}
                  {msg.details && (
                    <div className="text-xs opacity-90 space-y-1">
                      {msg.details.map((detail, idx) => (
                        <div key={idx}>{detail}</div>
                      ))}
                    </div>
                  )}

                  {/* Code Preview */}
                  {msg.code && (
                    <div className="bg-[var(--bg-0)] rounded-lg p-2 text-xs mono overflow-x-auto border border-[var(--line-soft)]">
                      <pre>{msg.code}</pre>
                    </div>
                  )}

                  {/* Review Results */}
                  {msg.review && (
                    <div className="space-y-3 text-xs mt-2 bg-[var(--bg-2)] rounded-xl p-3 border border-[var(--line-soft)]">
                      {/* CORRECTED CODE - SHOWN FIRST (Main Output) */}
                      {msg.review.improvedCode && (
                        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-3 border border-amber-400/35">
                          <h4 className="font-bold text-amber-500 dark:text-amber-200 mb-2 flex items-center gap-2">
                            <span className="text-lg">✨</span> Corrected Code
                            (Fixed)
                          </h4>
                          <div className="bg-[var(--bg-0)] rounded p-3 max-h-64 overflow-auto border border-amber-300/20">
                            <pre className="text-xs mono text-[var(--text-main)] whitespace-pre-wrap break-words">
                              {msg.review.improvedCode}
                            </pre>
                          </div>
                          <p className="text-amber-600 dark:text-amber-100/80 mt-2 text-xs">
                            ✓ This is the corrected version of your code with
                            all issues fixed.
                          </p>
                        </div>
                      )}

                      {/* Explanation */}
                      {msg.review.explanation && (
                        <div>
                          <h4 className="font-semibold text-teal-200 mb-1">
                            📋 What Was Fixed
                          </h4>
                          <p className="text-[var(--text-muted)] whitespace-pre-wrap line-clamp-4 text-xs">
                            {msg.review.explanation}
                          </p>
                        </div>
                      )}

                      {/* ML Error Detection Results */}
                      {msg.ml_detection && (
                        <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-lg p-3 border border-cyan-300/30 mt-3">
                          <h4 className="font-bold text-cyan-200 mb-2 flex items-center gap-2">
                            <span className="text-lg">🔍</span> ML Error
                            Detection
                          </h4>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-[var(--bg-0)] rounded p-2">
                              <p className="text-[var(--accent-strong)] text-xs font-semibold">
                                Errors Detected
                              </p>
                              <p className="text-[var(--text-main)] text-lg font-bold">
                                {msg.ml_detection.errors_found}
                              </p>
                            </div>
                            <div className="bg-[var(--bg-0)] rounded p-2">
                              <p className="text-[var(--accent-2)] text-xs font-semibold">
                                Warnings
                              </p>
                              <p className="text-[var(--text-main)] text-lg font-bold">
                                {msg.ml_detection.warnings_found}
                              </p>
                            </div>
                          </div>

                          {msg.ml_detection.error_details &&
                            msg.ml_detection.error_details.length > 0 && (
                              <div>
                                <p className="text-cyan-100 text-xs font-semibold mb-2">
                                  Error Types:
                                </p>
                                <ul className="space-y-1">
                                  {msg.ml_detection.error_details
                                    .slice(0, 4)
                                    .map((err, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs text-[var(--text-muted)] flex gap-2"
                                      >
                                        <span
                                          className={`px-2 py-1 rounded font-bold ${
                                            err.severity === "HIGH"
                                              ? "bg-red-500/30 text-red-300"
                                              : "bg-yellow-500/30 text-yellow-300"
                                          }`}
                                        >
                                          {err.type}
                                        </span>
                                        <span>{err.message}</span>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}

                          {msg.ml_detection.ml_improvements > 0 && (
                            <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                              <p className="text-green-300 text-xs font-semibold">
                                ✓ {msg.ml_detection.ml_improvements}{" "}
                                improvements applied
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Suggestions */}
                      {msg.review.suggestions &&
                        msg.review.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-emerald-200 mb-1">
                              💡 Improvements Made
                            </h4>
                            <ul className="space-y-1 text-[var(--text-muted)]">
                              {msg.review.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="flex gap-2 text-xs">
                                  <span className="text-green-400 flex-shrink-0">
                                    ✓
                                  </span>
                                  <span className="line-clamp-2">
                                    {suggestion}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Quality Assessment */}
                  {msg.quality && (
                    <div className="space-y-3 text-xs mt-2 bg-[var(--bg-2)] rounded-xl p-3 border border-[var(--line-soft)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-cyan-200">
                          Quality Score
                        </span>
                        <span className="text-lg font-bold text-cyan-100">
                          {msg.quality.score}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Grade:</span>
                        <span
                          className={`px-2 py-1 rounded font-bold ${
                            msg.quality.grade === "A"
                              ? "bg-green-500/30 text-green-300"
                              : msg.quality.grade === "B"
                                ? "bg-yellow-500/30 text-yellow-300"
                                : "bg-red-500/30 text-red-300"
                          }`}
                        >
                          {msg.quality.grade}
                        </span>
                      </div>

                      {msg.quality.strengths &&
                        msg.quality.strengths.length > 0 && (
                          <div>
                            <p className="font-semibold text-green-300 mb-1">
                              ✅ Strengths
                            </p>
                            <ul className="space-y-1 text-[var(--text-muted)]">
                              {msg.quality.strengths.map((s, i) => (
                                <li key={i} className="text-xs">
                                  • {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {msg.quality.weaknesses &&
                        msg.quality.weaknesses.length > 0 && (
                          <div>
                            <p className="font-semibold text-yellow-300 mb-1">
                              ⚠️ Weaknesses
                            </p>
                            <ul className="space-y-1 text-[var(--text-muted)]">
                              {msg.quality.weaknesses.map((w, i) => (
                                <li key={i} className="text-xs">
                                  • {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {msg.quality.recommendation && (
                        <div className="bg-cyan-500/15 border border-cyan-400/25 rounded p-2 mt-2">
                          <p className="font-semibold text-cyan-200 mb-1 text-xs">
                            💡 Recommendation
                          </p>
                          <p className="text-[var(--text-muted)] text-xs">
                            {msg.quality.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-[var(--bg-1)] border border-[var(--line-soft)] text-[var(--text-main)] rounded-br-2xl rounded-tr-2xl rounded-tl-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--line-soft)] bg-[var(--surface-elevated)] p-3 md:p-4 space-y-3 shrink-0">
          {/* File info */}
          {fileName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-3 py-2 bg-teal-500/15 border border-teal-300/35 rounded-lg text-sm text-teal-100"
            >
              <FiCheck size={16} />
              <span>File: {fileName}</span>
              <button
                onClick={() => {
                  setCode("");
                  setFileName("");
                }}
                className="ml-auto hover:text-teal-50"
              >
                <FiX size={16} />
              </button>
            </motion.div>
          )}

          {/* Code Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              {/* Upload Button */}
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-1)] hover:bg-[var(--bg-2)] border border-[var(--line-soft)] rounded-lg transition-colors text-sm font-medium text-[var(--text-main)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUpload size={16} />
                Upload
              </motion.button>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmitCode}
                disabled={!code.trim() || loading}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition text-sm font-semibold text-slate-900"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSend size={16} />
                Review
              </motion.button>
            </div>

            {/* Text Area */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste your code here... (or upload a file above)"
              className="w-full px-4 py-2 bg-[var(--bg-0)] border border-[var(--line-soft)] rounded-lg text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
              rows={3}
            />

            <p className="text-xs text-[var(--text-muted)]">
              Tip: Press Ctrl+Enter to submit, or click the Review button
            </p>
          </div>

          {/* Chat Input Area - Shown after code analysis */}
          {codeAnalyzed && (
            <motion.div
              ref={chatSectionRef}
              className="border-t border-[var(--line-soft)] space-y-2 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Collapse Button */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-semibold">
                  💬 Ask Questions
                </span>
                <motion.button
                  onClick={() => setChatCollapsed(!chatCollapsed)}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-[var(--bg-2)] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {chatCollapsed ? (
                    <>
                      <FiChevronDown size={16} />
                      <span className="text-xs">Show</span>
                    </>
                  ) : (
                    <>
                      <FiChevronUp size={16} />
                      <span className="text-xs">Hide</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Chat Input - Animated Collapse/Expand */}
              <AnimatePresence>
                {!chatCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <textarea
                          ref={chatInputRef}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={handleChatKeyPress}
                          placeholder="Ask a question about your code... (Ctrl+Enter to send)"
                          className="flex-1 px-3 py-2 bg-[var(--bg-0)] border border-[var(--line-soft)] rounded-lg text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
                          rows={2}
                        />

                        <motion.button
                          onClick={handleChatSubmit}
                          disabled={!chatInput.trim() || loading}
                          className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition text-sm font-semibold text-slate-900"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiSend size={16} />
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] px-2">
                      💬 Ask questions like: "How can I optimize this?", "What
                      does this function do?", "Are there any bugs?"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".js,.jsx,.py,.ts,.tsx,.java,.cpp,.c,.cs"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
