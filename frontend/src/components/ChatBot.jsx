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
  FiMessageCircle,
} from "react-icons/fi";
import { reviewCode, chatWithAI, assessCodeQuality } from "../utils/api";

const ChatBot = () => {
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
  const [qualityAssessment, setQualityAssessment] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatInputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      alert("Please upload a file or paste code");
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
      const result = await reviewCode(code, language, []);

      // Add bot response with review
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "✅ Code Review Complete",
          review: {
            explanation: result.explanation,
            suggestions: result.suggestions,
            improvedCode: result.improvedCode,
          },
        },
      ]);

      // Enable chat mode
      setCodeAnalyzed(true);

      // Clear input
      setCode("");
      setFileName("");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Error analyzing code",
          details: [error.message || "Failed to review code"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle quality assessment
  const handleAssessQuality = async () => {
    if (!code.trim()) return;

    setLoading(true);
    try {
      const result = await assessCodeQuality(code, language);
      setQualityAssessment(result.assessment);

      // Add quality assessment message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "📊 Code Quality Assessment",
          quality: result.assessment,
          issuesCount: result.issuesCount,
        },
      ]);

      setCodeAnalyzed(true);
    } catch (error) {
      console.error("Quality assessment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle chat message submission
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !code.trim()) return;

    // Add user chat message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        text: chatInput,
      },
    ]);

    setChatInput("");
    setLoading(true);

    try {
      const result = await chatWithAI(
        chatInput,
        code,
        language,
        qualityAssessment,
      );

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: result.response,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          text: "❌ Error processing your question",
          details: [error.message || "Failed to process"],
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    ? "bg-blue-600 text-white rounded-bl-2xl rounded-tl-2xl rounded-tr-lg"
                    : "bg-slate-700 text-slate-100 rounded-br-2xl rounded-tr-2xl rounded-tl-lg"
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
                  <div className="bg-slate-900 rounded p-2 text-xs font-mono overflow-x-auto">
                    <pre>{msg.code}</pre>
                  </div>
                )}

                {/* Review Results */}
                {msg.review && (
                  <div className="space-y-3 text-xs mt-2 bg-slate-900/50 rounded p-3">
                    {/* Explanation */}
                    {msg.review.explanation && (
                      <div>
                        <h4 className="font-semibold text-blue-300 mb-1">
                          📋 Analysis
                        </h4>
                        <p className="text-slate-300 whitespace-pre-wrap line-clamp-6">
                          {msg.review.explanation}
                        </p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {msg.review.suggestions &&
                      msg.review.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-300 mb-1">
                            💡 Suggestions
                          </h4>
                          <ul className="space-y-1 text-slate-300">
                            {msg.review.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-green-400">✓</span>
                                <span className="line-clamp-2">
                                  {suggestion}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Improved Code */}
                    {msg.review.improvedCode && (
                      <div>
                        <h4 className="font-semibold text-yellow-300 mb-1">
                          ✨ Improved Code
                        </h4>
                        <div className="bg-slate-800 rounded p-2 max-h-40 overflow-auto">
                          <pre className="text-xs font-mono text-slate-300">
                            {msg.review.improvedCode}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quality Assessment */}
                {msg.quality && (
                  <div className="space-y-3 text-xs mt-2 bg-slate-900/50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-cyan-300">
                        Quality Score
                      </span>
                      <span className="text-lg font-bold text-cyan-400">
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
                          <ul className="space-y-1 text-slate-300">
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
                          <ul className="space-y-1 text-slate-300">
                            {msg.quality.weaknesses.map((w, i) => (
                              <li key={i} className="text-xs">
                                • {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {msg.quality.recommendation && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2 mt-2">
                        <p className="font-semibold text-blue-300 mb-1 text-xs">
                          💡 Recommendation
                        </p>
                        <p className="text-slate-300 text-xs">
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
            <div className="bg-slate-700 text-slate-100 rounded-br-2xl rounded-tr-2xl rounded-tl-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-slate-800/50 p-4 space-y-3">
        {/* File info */}
        {fileName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm text-blue-300"
          >
            <FiCheck size={16} />
            <span>File: {fileName}</span>
            <button
              onClick={() => {
                setCode("");
                setFileName("");
              }}
              className="ml-auto hover:text-blue-200"
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
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiUpload size={16} />
              Upload
            </motion.button>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmitCode}
              disabled={!code.trim() || loading}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSend size={16} />
              Review
            </motion.button>

            {/* Quality Assessment Button */}
            {codeAnalyzed && (
              <motion.button
                onClick={handleAssessQuality}
                disabled={!code.trim() || loading}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📊 Assess Quality
              </motion.button>
            )}
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Paste your code here... (or upload a file above)"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
          />

          <p className="text-xs text-slate-400">
            Tip: Press Ctrl+Enter to submit, or click the Review button
          </p>
        </div>

        {/* Chat Input Area - Shown after code analysis */}
        {codeAnalyzed && (
          <motion.div
            className="border-t border-white/10 space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Ask a question about your code... (Ctrl+Enter to send)"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                  rows={2}
                />

                <motion.button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || loading}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiSend size={16} />
                </motion.button>
              </div>
            </div>
            <p className="text-xs text-slate-400 px-2">
              💬 Ask questions like: "How can I optimize this?", "What does this
              function do?", "Are there any bugs?"
            </p>
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
  );
};

export default ChatBot;
