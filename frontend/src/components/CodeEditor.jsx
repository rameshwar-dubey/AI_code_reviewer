/**
 * CodeEditor Component - Monaco Editor with Auto Pipeline
 * Features:
 * - Real-time linting (debounced 700ms)
 * - Automatic code analysis on change
 * - Inline error highlighting
 * - Dark theme
 * - Glassmorphism styling
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { analyzeCode } from '../utils/api';
import { debounce } from '../utils/helpers';

const CodeEditor = ({
  code = `// Write your code here\nfunction hello() {\n  console.log("Hello, World!");\n}`,
  setCode,
  language = 'javascript',
  setLanguage,
  setIssues,
  setLoading,
  onAnalysisResult,
  issues = [],
}) => {
  const editorRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [analysisResult, setAnalysisResult] = useState(null);

  /**
   * Debounced analysis function - triggers automatic pipeline
   */
  const analyzeCodeDebounced = useCallback(
    debounce(async (codeToAnalyze) => {
      if (!codeToAnalyze || !codeToAnalyze.trim()) return;

      setLoading?.(true);
      try {
        const result = await analyzeCode(codeToAnalyze, selectedLanguage);
        
        // Check for validation errors
        if (result.status === 400 && result.validation) {
          console.warn("⚠️ Validation failed:", result.validation);
          const validation = result.validation;
          
          // Show validation error with suggestions
          const validationWarnings = validation.warnings.map((w, idx) => ({
            id: `validation-${idx}`,
            level: w.startsWith("ERROR") ? "error" : "warning",
            message: w
          }));
          
          setIssues?.({
            lint: validationWarnings,
            validation: validation,
            errors: validationWarnings.filter(e => e.level === "error"),
            warnings: validationWarnings.filter(e => e.level === "warning")
          });
          
          // Don't set analysis result if validation failed
          setLoading?.(false);
          return;
        }
        
        console.log('✅ Automatic analysis complete:', result);
        
        setAnalysisResult(result.data);
        onAnalysisResult?.(result.data);
        setIssues?.(result.data?.errors || []);

        // Convert to Monaco markers for inline display
        const monacoMarkers = (result.data?.errors?.lint || []).map((err) => ({
          startLineNumber: err.line || 1,
          startColumn: err.column || 1,
          endLineNumber: err.line || 1,
          endColumn: (err.column || 1) + 10,
          message: err.message,
          severity: err.severity === 'error' ? 8 : err.severity === 'warning' ? 4 : 2,
          code: err.ruleId,
        }));

        setMarkers(monacoMarkers);
      } catch (error) {
        console.error('❌ Analysis error:', error);
      } finally {
        setLoading?.(false);
      }
    }, 700),
    [selectedLanguage, setLoading, setIssues, onAnalysisResult]
  );

  /**
   * Handle code change - triggers debounced analysis
   */
  const handleEditorChange = (value) => {
    const newCode = value || '';
    setCode?.(newCode);
    analyzeCodeDebounced(newCode);
  };

  /**
   * Handle language change
   */
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setLanguage?.(newLang);
  };

  /**
   * Set markers when editor mounts
   */
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  /**
   * Update Monaco markers whenever they change
   */
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model && window.monaco) {
        window.monaco.editor.setModelMarkers(model, 'owner', markers);
      }
    }
  }, [markers]);

  /**
   * Re-analyze when language changes
   */
  useEffect(() => {
    if (code && code.trim()) {
      analyzeCodeDebounced(code);
    }
  }, [selectedLanguage]);

  return (
    <motion.div
      className="code-editor-container h-full flex flex-col bg-gradient-to-br from-slate-900/40 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-semibold text-white/80">CODE EDITOR</h3>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/60">Language:</label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Analysis Status */}
        {analysisResult && (
          <div className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Analyzed
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={selectedLanguage}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            fontFamily: 'Fira Code, Monaco, monospace',
            fontLigatures: true,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            automaticLayout: true,
            renderWhitespace: 'selection',
            padding: { top: 10 }
          }}
        />
      </div>

      {/* Footer Stats */}
      {analysisResult && (
        <motion.div
          className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5 text-xs text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex gap-6">
            <div>
              <span className="text-white/40">Errors:</span>{' '}
              <span className={analysisResult.summary?.total_errors > 0 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                {analysisResult.summary?.total_errors || 0}
              </span>
            </div>
            <div>
              <span className="text-white/40">Quality:</span>{' '}
              <span className={
                analysisResult.summary?.quality_score >= 80 ? 'text-green-400 font-semibold' :
                analysisResult.summary?.quality_score >= 60 ? 'text-yellow-400 font-semibold' :
                'text-red-400 font-semibold'
              }>
                {analysisResult.summary?.quality_score || 0}/100
              </span>
            </div>
            <div>
              <span className="text-white/40">Risk:</span>{' '}
              <span className={
                analysisResult.summary?.risk_assessment === 'Low' ? 'text-green-400 font-semibold' :
                analysisResult.summary?.risk_assessment === 'Medium' ? 'text-yellow-400 font-semibold' :
                'text-red-400 font-semibold'
              }>
                {analysisResult.summary?.risk_assessment}
              </span>
            </div>
          </div>
          <div className="text-white/40">
            {code.split('\n').length} lines • {code.length} chars
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CodeEditor;
        <span>{issues.length} issues found</span>
      </div>
    </motion.div>
  );
};

export default CodeEditor;
