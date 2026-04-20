/**
 * CodeEditor Component - Monaco Editor integration with real-time linting
 */

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { FiZap, FiPlay } from "react-icons/fi";
import { analyzeCode, fixCode } from "../utils/api";
import { debounce } from "../utils/helpers";

const CodeEditor = ({
  code,
  setCode,
  language,
  setLanguage,
  setIssues,
  setLoading,
  issues = [],
}) => {
  const editorRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [autoFixLoading, setAutoFixLoading] = useState(false);

  // Debounced analysis function
  const debouncedAnalyze = debounce(async (sourceCode) => {
    if (!sourceCode.trim()) {
      setIssues([]);
      setMarkers([]);
      return;
    }

    console.log(
      `[ANALYZE] Analyzing ${language} code, length: ${sourceCode.length}`,
    );
    setLoading(true);
    try {
      const response = await analyzeCode(sourceCode, language);
      const analysisIssues = response.issues || [];
      console.log(
        `[ANALYZE] Received ${analysisIssues.length} issues from backend`,
      );
      setIssues(analysisIssues);

      // Convert issues to Monaco markers
      const monacoMarkers = analysisIssues.map((issue) => ({
        startLineNumber: issue.line,
        startColumn: issue.column,
        endLineNumber: issue.line,
        endColumn: issue.endColumn || issue.column + 1,
        message: issue.message,
        severity:
          issue.severity === "error" ? 8 : issue.severity === "warning" ? 4 : 2,
        code: issue.ruleId,
      }));

      setMarkers(monacoMarkers);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  }, 700); // 700ms debounce

  // Handle code change
  const handleEditorChange = (value) => {
    setCode(value || "");
    debouncedAnalyze(value || "");
  };

  // Auto fix code
  const handleAutoFix = async () => {
    setAutoFixLoading(true);
    try {
      const response = await fixCode(code, language, issues);

      if (response.error) {
        console.error("Auto fix error:", response.error);
        alert(
          `Auto Fix failed: ${response.error}\n\nMake sure you have configured OPENAI_API_KEY in backend/.env`,
        );
        return;
      }

      if (response.fixedCode) {
        // Check if code was actually changed
        if (response.fixedCode === code) {
          console.warn(
            "Auto fix returned original code - API key might not be configured",
          );
          alert(
            "Auto Fix could not improve the code.\n\nEnsure OPENAI_API_KEY is properly configured in backend/.env",
          );
          return;
        }

        setCode(response.fixedCode);
        // Re-analyze after fix
        debouncedAnalyze(response.fixedCode);
      } else {
        alert("Auto Fix failed: No response from server");
      }
    } catch (error) {
      console.error("Auto fix failed:", error);
      alert(`Auto Fix error: ${error.message}\n\nCheck console for details.`);
    } finally {
      setAutoFixLoading(false);
    }
  };

  // Set markers when editor is ready
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // Update markers whenever they change
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        window.monaco.editor.setModelMarkers(model, "owner", markers);
      }
    }
  }, [markers]);

  // Re-analyze when language changes
  useEffect(() => {
    if (code.trim()) {
      console.log(`Language changed to ${language}, re-analyzing code...`);
      debouncedAnalyze(code);
    }
  }, [language]);

  return (
    <motion.div
      className="glass rounded-lg p-4 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Code Editor</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="glass-sm px-3 py-1 text-sm rounded cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Action buttons */}
        <motion.button
          onClick={handleAutoFix}
          disabled={autoFixLoading || code.trim().length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiZap size={16} />
          {autoFixLoading ? "Fixing..." : "Auto Fix"}
        </motion.button>
      </div>

      {/* Editor */}
      <div className="flex-1 rounded-lg overflow-hidden border border-white/10">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Monaco', monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            tabSize: 2,
            wordWrap: "on",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
            },
          }}
        />
      </div>

      {/* Status bar */}
      <div className="mt-3 text-xs text-slate-400 flex justify-between px-2">
        <span>{code.split("\n").length} lines</span>
        <span>{code.length} characters</span>
        <span>{issues.length} issues found</span>
      </div>
    </motion.div>
  );
};

export default CodeEditor;
