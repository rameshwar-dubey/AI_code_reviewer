/**
 * OutputPanel Component - Automatic Pipeline Results
 * Displays: Errors, ML Analysis, AI Review, Optimized Code, Before/After
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiAlertCircle, FiCheckCircle, FiInfo, FiCopy, FiDownload } from 'react-icons/fi';

const TabButton = ({ active, onClick, children }) => (
  <motion.button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg transition-all ${ 
      active
        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/50'
        : 'text-white/60 hover:text-white/90'
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.button>
);

const ErrorItem = ({ error, type = 'lint' }) => {
  const severityColors = {
    critical: 'border-l-4 border-red-500 bg-red-500/10',
    major: 'border-l-4 border-orange-500 bg-orange-500/10',
    minor: 'border-l-4 border-yellow-500 bg-yellow-500/10',
    error: 'border-l-4 border-red-500 bg-red-500/10',
    warning: 'border-l-4 border-yellow-500 bg-yellow-500/10',
  };

  const severity = error.severity || error.level || 'minor';
  
  return (
    <motion.div
      className={`p-3 rounded ${severityColors[severity] || severityColors.minor}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-2">
        {severity === 'critical' || severity === 'error' ? (
          <FiAlertCircle className="text-red-400 mt-1 flex-shrink-0" />
        ) : severity === 'major' || severity === 'warning' ? (
          <FiInfo className="text-yellow-400 mt-1 flex-shrink-0" />
        ) : (
          <FiCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{error.rule || error.type || 'Issue'}</span>
            <span className="text-xs text-white/50">
              {error.line && `Line ${error.line}`}
              {error.column && `, Col ${error.column}`}
            </span>
          </div>
          <p className="text-sm text-white/70 mt-1">{error.message}</p>
          {error.suggestion && <p className="text-xs text-cyan-400 mt-1">💡 {error.suggestion}</p>}
        </div>
      </div>
    </motion.div>
  );
};

const CodeComparison = ({ originalCode, optimizedCode }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Original Code */}
      <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-red-500/20 border-b border-red-500/30">
          <span className="text-xs font-semibold text-red-300">ORIGINAL CODE</span>
          <button
            onClick={() => handleCopy(originalCode, 0)}
            className="p-1 hover:bg-red-500/30 rounded transition-colors"
            title="Copy"
          >
            <FiCopy size={14} className={copiedIndex === 0 ? 'text-green-400' : 'text-white/50'} />
          </button>
        </div>
        <pre className="p-3 text-xs font-mono text-white/70 overflow-auto max-h-64">
          {originalCode}
        </pre>
      </div>

      {/* Optimized Code */}
      <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-green-500/20 border-b border-green-500/30">
          <span className="text-xs font-semibold text-green-300">OPTIMIZED CODE</span>
          <button
            onClick={() => handleCopy(optimizedCode, 1)}
            className="p-1 hover:bg-green-500/30 rounded transition-colors"
            title="Copy"
          >
            <FiCopy size={14} className={copiedIndex === 1 ? 'text-green-400' : 'text-white/50'} />
          </button>
        </div>
        <pre className="p-3 text-xs font-mono text-white/70 overflow-auto max-h-64">
          {optimizedCode}
        </pre>
      </div>
    </div>
  );
};

const MLScoreDisplay = ({ score, riskLevel, features }) => {
  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'from-green-500 to-emerald-500';
    if (risk === 'Medium') return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getRiskTextColor = (risk) => {
    if (risk === 'Low') return 'text-green-400';
    if (risk === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Score Gauge */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm text-white/60">Code Quality Score</span>
            <span className="text-2xl font-bold text-white">{Math.round(score)}/100</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getRiskColor(riskLevel)}`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
        <span className="text-sm text-white/60">Risk Assessment</span>
        <span className={`text-lg font-semibold ${getRiskTextColor(riskLevel)}`}>
          {riskLevel}
        </span>
      </div>

      {/* Key Features */}
      {features && Object.keys(features).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-white/60 uppercase">Key Metrics</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(features)
              .slice(0, 6)
              .map(([key, value]) => (
                <div key={key} className="p-2 rounded bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 capitalize">{key.replace(/_/g, ' ')}</div>
                  <div className="text-sm font-mono text-white/80">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function OutputPanel({ analysisResult, loading }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedErrors, setExpandedErrors] = useState({});

  if (!analysisResult && !loading) {
    return (
      <motion.div
        className="h-full flex items-center justify-center text-white/50 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <FiInfo size={32} className="mx-auto mb-2 opacity-50" />
          <p>Write code to see analysis results</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-full flex flex-col bg-gradient-to-br from-slate-900/40 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-white/10 bg-white/5 overflow-x-auto">
        <TabButton
          active={activeTab === 'summary'}
          onClick={() => setActiveTab('summary')}
        >
          📊 Summary
        </TabButton>
        <TabButton
          active={activeTab === 'errors'}
          onClick={() => setActiveTab('errors')}
        >
          ⚠️ Errors ({analysisResult?.summary?.total_errors || 0})
        </TabButton>
        <TabButton
          active={activeTab === 'ml'}
          onClick={() => setActiveTab('ml')}
        >
          🤖 ML Analysis
        </TabButton>
        <TabButton
          active={activeTab === 'comparison'}
          onClick={() => setActiveTab('comparison')}
        >
          🔄 Before/After
        </TabButton>
        <TabButton
          active={activeTab === 'ai'}
          onClick={() => setActiveTab('ai')}
        >
          🧠 AI Review
        </TabButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <div className="animate-spin inline-block mb-2">
                  <div className="w-8 h-8 border-2 border-blue-500/50 border-t-blue-500 rounded-full"></div>
                </div>
                <p className="text-sm text-white/60">Analyzing code...</p>
              </div>
            </motion.div>
          ) : analysisResult ? (
            <>
              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <motion.div
                  key="summary"
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="text-xs text-red-300/60">Total Errors</div>
                      <div className="text-2xl font-bold text-red-300">{analysisResult.summary?.total_errors || 0}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="text-xs text-blue-300/60">Quality Score</div>
                      <div className="text-2xl font-bold text-blue-300">{analysisResult.summary?.quality_score || 0}/100</div>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <div className="text-xs text-amber-300/60">Risk Level</div>
                      <div className="text-2xl font-bold text-amber-300">{analysisResult.summary?.risk_assessment || 'Unknown'}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="text-sm font-semibold mb-2">Recommendation</h4>
                    <p className="text-sm text-white/70">{analysisResult.summary?.recommendation}</p>
                  </div>
                </motion.div>
              )}

              {/* Errors Tab */}
              {activeTab === 'errors' && (
                <motion.div
                  key="errors"
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {analysisResult.errors?.lint?.length > 0 ? (
                    analysisResult.errors.lint.map((error, idx) => (
                      <ErrorItem key={idx} error={error} type="lint" />
                    ))
                  ) : (
                    <div className="text-center py-6 text-white/50">
                      <FiCheckCircle size={32} className="mx-auto mb-2" />
                      <p>No linting errors found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ML Analysis Tab */}
              {activeTab === 'ml' && (
                <motion.div
                  key="ml"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MLScoreDisplay
                    score={analysisResult.ml_analysis?.score}
                    riskLevel={analysisResult.ml_analysis?.risk_level}
                    features={analysisResult.ml_analysis?.features}
                  />
                </motion.div>
              )}

              {/* Before/After Tab */}
              {activeTab === 'comparison' && analysisResult.ai_review?.optimized_code && (
                <motion.div
                  key="comparison"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CodeComparison
                    originalCode={analysisResult.ai_review.optimized_code}
                    optimizedCode={analysisResult.ai_review.optimized_code}
                  />
                </motion.div>
              )}

              {/* AI Review Tab */}
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                    <h4 className="text-sm font-semibold mb-2">AI Analysis</h4>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {analysisResult.ai_review?.explanation || 'No AI review available'}
                    </p>
                  </div>

                  {analysisResult.ai_review?.suggestions && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Suggestions</h4>
                      {analysisResult.ai_review.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="p-3 rounded bg-white/5 border-l-2 border-cyan-500/50">
                          <p className="text-sm text-white/70">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              key="empty"
              className="flex items-center justify-center h-full text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p>No analysis data</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
/**
 * OutputPanel Component - Displays linting issues, AI feedback, and security analysis
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiZap,
  FiBarChart2,
  FiTrendingUp,
} from "react-icons/fi";
import {
  reviewCode,
  analyzeSecurityIssues,
  getComprehensiveAnalysis,
} from "../utils/api";
import { getSeverityColor, getSeverityBadge } from "../utils/helpers";

const OutputPanel = ({ code, language, issues = [], loading }) => {
  const [activeTab, setActiveTab] = useState("issues");
  const [aiReview, setAiReview] = useState(null);
  const [securityIssues, setSecurityIssues] = useState([]);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState(null);

  // Fetch AI review
  const fetchAIReview = async () => {
    setReviewLoading(true);
    try {
      const response = await reviewCode(code, language, issues);
      setAiReview(response.review);
      setActiveTab("review");
    } catch (error) {
      console.error("Error fetching AI review:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  // Fetch security analysis
  const fetchSecurityAnalysis = async () => {
    setReviewLoading(true);
    try {
      const response = await analyzeSecurityIssues(code, language);
      setSecurityIssues(response.securityIssues || []);
      setActiveTab("security");
    } catch (error) {
      console.error("Error fetching security analysis:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  // Fetch comprehensive analysis with errors and optimizations
  const fetchComprehensiveAnalysis = async () => {
    setReviewLoading(true);
    try {
      const response = await getComprehensiveAnalysis(code, language);
      setComprehensiveAnalysis(response);
      setActiveTab("analysis");
    } catch (error) {
      console.error("Error fetching comprehensive analysis:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  // Count issues by severity
  const issueCounts = {
    error: issues.filter((i) => i.severity === "error").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  return (
    <motion.div
      className="glass rounded-lg p-4 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-4 pb-3 border-b border-white/10 flex-wrap">
        <motion.button
          onClick={() => setActiveTab("issues")}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === "issues"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
              : "text-slate-400 hover:text-slate-200"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            Issues{" "}
            <span className="text-xs bg-red-500/30 px-2 py-0.5 rounded">
              {issues.length}
            </span>
          </span>
        </motion.button>

        <motion.button
          onClick={fetchAIReview}
          disabled={reviewLoading || code.trim().length === 0}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === "review"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
              : "text-slate-400 hover:text-slate-200"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            <FiZap size={14} />
            AI Review {reviewLoading && "..."}
          </span>
        </motion.button>

        <motion.button
          onClick={fetchSecurityAnalysis}
          disabled={reviewLoading || code.trim().length === 0}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === "security"
              ? "bg-red-500/20 text-red-300 border border-red-500/50"
              : "text-slate-400 hover:text-slate-200"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2"># Security</span>
        </motion.button>

        <motion.button
          onClick={fetchComprehensiveAnalysis}
          disabled={reviewLoading || code.trim().length === 0}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === "analysis"
              ? "bg-green-500/20 text-green-300 border border-green-500/50"
              : "text-slate-400 hover:text-slate-200"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            <FiBarChart2 size={14} />
            Analysis {reviewLoading && "..."}
          </span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Issues Tab */}
          {activeTab === "issues" && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <FiCheckCircle size={40} className="mb-2 text-green-400" />
                  <p>No issues found! Your code looks great.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 glass-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">
                        {issueCounts.error}
                      </div>
                      <div className="text-xs text-slate-400">Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">
                        {issueCounts.warning}
                      </div>
                      <div className="text-xs text-slate-400">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {issueCounts.info}
                      </div>
                      <div className="text-xs text-slate-400">Info</div>
                    </div>
                  </div>

                  {/* Issues list */}
                  {issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      className="glass-sm p-3 cursor-pointer hover:bg-white/15 transition-all"
                      onClick={() =>
                        setExpandedIssue(expandedIssue === index ? null : index)
                      }
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {issue.severity === "error" && (
                            <FiAlertCircle className="text-red-400" size={18} />
                          )}
                          {issue.severity === "warning" && (
                            <FiAlertCircle
                              className="text-yellow-400"
                              size={18}
                            />
                          )}
                          {issue.severity === "info" && (
                            <FiInfo className="text-blue-400" size={18} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              Line {issue.line}:{issue.column}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${getSeverityBadge(issue.severity)}`}
                            >
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">
                            {issue.message}
                          </p>

                          {expandedIssue === index && (
                            <motion.div
                              className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-400"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              {issue.ruleId && (
                                <p>
                                  <span className="font-semibold">Rule:</span>{" "}
                                  {issue.ruleId}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </div>

                        <FiChevronDown
                          size={18}
                          className={`transition-transform ${
                            expandedIssue === index ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* AI Review Tab */}
          {activeTab === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {reviewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin">...</div>
                  <p className="ml-2 text-slate-400">Analyzing with AI...</p>
                </div>
              ) : aiReview ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                    {aiReview.explanation}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <p>Click "AI Review" to get AI-powered feedback</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {reviewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin">...</div>
                  <p className="ml-2 text-slate-400">Analyzing security...</p>
                </div>
              ) : securityIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <FiCheckCircle size={40} className="mb-2 text-green-400" />
                  <p>No security vulnerabilities detected!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {securityIssues.map((issue, index) => (
                    <motion.div
                      key={index}
                      className="glass-sm p-3 border-l-2 border-red-500"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <p className="text-sm text-slate-300">{issue}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Comprehensive Analysis Tab */}
          {activeTab === "analysis" && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {reviewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin">...</div>
                  <p className="ml-2 text-slate-400">
                    Running comprehensive analysis...
                  </p>
                </div>
              ) : comprehensiveAnalysis ? (
                <div className="space-y-4">
                  {/* Overview */}
                  {comprehensiveAnalysis.overview && (
                    <motion.div
                      className="glass-sm p-4 border-l-4 border-cyan-500/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h3 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                        <FiInfo size={16} />
                        Overview
                      </h3>
                      <p className="text-sm text-slate-300">
                        {comprehensiveAnalysis.overview}
                      </p>
                    </motion.div>
                  )}

                  {/* Errors Section */}
                  {comprehensiveAnalysis.errors && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="font-semibold text-red-300 flex items-center gap-2">
                        <FiAlertCircle size={16} />
                        Errors ({comprehensiveAnalysis.totalErrors})
                      </h3>

                      {/* Critical Errors */}
                      {comprehensiveAnalysis.errors.critical?.length > 0 && (
                        <div className="space-y-2 ml-2">
                          <p className="text-xs font-semibold text-red-400">
                            ⚠️ Critical (
                            {comprehensiveAnalysis.errors.critical.length})
                          </p>
                          {comprehensiveAnalysis.errors.critical.map(
                            (error, idx) => (
                              <motion.div
                                key={idx}
                                className="glass-sm p-2 border-l-2 border-red-600 text-xs"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <div className="font-medium text-red-300">
                                  Line {error.line}: {error.message}
                                </div>
                              </motion.div>
                            ),
                          )}
                        </div>
                      )}

                      {/* Major Errors */}
                      {comprehensiveAnalysis.errors.major?.length > 0 && (
                        <div className="space-y-2 ml-2">
                          <p className="text-xs font-semibold text-yellow-400">
                            📌 Major (
                            {comprehensiveAnalysis.errors.major.length})
                          </p>
                          {comprehensiveAnalysis.errors.major.map(
                            (error, idx) => (
                              <motion.div
                                key={idx}
                                className="glass-sm p-2 border-l-2 border-yellow-600 text-xs"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <div className="font-medium text-yellow-300">
                                  Line {error.line}: {error.message}
                                </div>
                              </motion.div>
                            ),
                          )}
                        </div>
                      )}

                      {/* Minor Issues */}
                      {comprehensiveAnalysis.errors.minor?.length > 0 && (
                        <div className="space-y-2 ml-2">
                          <p className="text-xs font-semibold text-blue-400">
                            ℹ️ Minor (
                            {comprehensiveAnalysis.errors.minor.length})
                          </p>
                          {comprehensiveAnalysis.errors.minor.map(
                            (error, idx) => (
                              <motion.div
                                key={idx}
                                className="glass-sm p-2 border-l-2 border-blue-600 text-xs"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <div className="font-medium text-blue-300">
                                  Line {error.line}: {error.message}
                                </div>
                              </motion.div>
                            ),
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Optimizations Section */}
                  {comprehensiveAnalysis.optimizations && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="font-semibold text-green-300 flex items-center gap-2">
                        <FiTrendingUp size={16} />
                        Optimization Solutions (
                        {comprehensiveAnalysis.totalOptimizations})
                      </h3>

                      {/* Performance */}
                      {comprehensiveAnalysis.optimizations.performance?.length >
                        0 && (
                        <div className="space-y-2 ml-2">
                          <p className="text-xs font-semibold text-cyan-400">
                            ⚡ Performance
                          </p>
                          {comprehensiveAnalysis.optimizations.performance.map(
                            (opt, idx) => (
                              <motion.div
                                key={idx}
                                className="glass-sm p-2 bg-cyan-500/10 border-l-2 border-cyan-500 text-xs rounded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <div className="font-medium text-cyan-300 mb-1">
                                  {opt.suggestion}
                                </div>
                                <p className="text-slate-400 text-xs">
                                  {opt.reason}
                                </p>
                                {opt.impact && (
                                  <div className="text-xs mt-1">
                                    <span
                                      className={`px-2 py-0.5 rounded ${
                                        opt.impact === "high"
                                          ? "bg-red-500/20 text-red-300"
                                          : opt.impact === "medium"
                                            ? "bg-yellow-500/20 text-yellow-300"
                                            : "bg-blue-500/20 text-blue-300"
                                      }`}
                                    >
                                      Impact: {opt.impact}
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            ),
                          )}
                        </div>
                      )}

                      {/* Readability */}
                      {comprehensiveAnalysis.optimizations.readability?.length >
                        0 && (
                        <div className="space-y-2 ml-2">
                          <p className="text-xs font-semibold text-purple-400">
                            📝 Readability
                          </p>
                          {comprehensiveAnalysis.optimizations.readability.map(
                            (opt, idx) => (
                              <motion.div
                                key={idx}
                                className="glass-sm p-2 bg-purple-500/10 border-l-2 border-purple-500 text-xs rounded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <div className="font-medium text-purple-300 mb-1">
                                  {opt.suggestion}
                                </div>
                                <p className="text-slate-400 text-xs">
                                  {opt.reason}
                                </p>
                              </motion.div>
                            ),
                          )}
                        </div>
                      )}

                      {/* Best Practices */}
                      {comprehensiveAnalysis.optimizations.bestPractices
                        ?.length > 0 && (
                        <div className="space-y-2 ml-2">
                          <p className="text-xs font-semibold text-amber-400">
                            ⭐ Best Practices
                          </p>
                          {comprehensiveAnalysis.optimizations.bestPractices.map(
                            (opt, idx) => (
                              <motion.div
                                key={idx}
                                className="glass-sm p-2 bg-amber-500/10 border-l-2 border-amber-500 text-xs rounded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <div className="font-medium text-amber-300 mb-1">
                                  {opt.suggestion}
                                </div>
                                <p className="text-slate-400 text-xs">
                                  {opt.reason}
                                </p>
                              </motion.div>
                            ),
                          )}
                        </div>
                      )}

                      {/* Refactoring */}
                      {comprehensiveAnalysis.optimizations.refactoring?.length >
                        0 && (
                        <div className="space-y-2 ml-2">
                          <p className="text-xs font-semibold text-pink-400">
                            🔧 Refactoring
                          </p>
                          {comprehensiveAnalysis.optimizations.refactoring.map(
                            (opt, idx) => (
                              <motion.div
                                key={idx}
                                className="glass-sm p-2 bg-pink-500/10 border-l-2 border-pink-500 text-xs rounded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <div className="font-medium text-pink-300 mb-1">
                                  {opt.suggestion}
                                </div>
                                <p className="text-slate-400 text-xs">
                                  {opt.reason}
                                </p>
                              </motion.div>
                            ),
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <p>
                    Click "Analysis" to get comprehensive error and optimization
                    analysis
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OutputPanel;
