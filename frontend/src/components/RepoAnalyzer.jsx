/**
 * RepoAnalyzer Component - GitHub repository analysis
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiGithub, FiX } from "react-icons/fi";
import { analyzeRepository } from "../utils/api";

const RepoAnalyzer = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoResults, setRepoResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeRepository(repoUrl);
      setRepoResults(response);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to analyze repository",
      );
      setRepoResults(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass max-w-3xl w-full max-h-[86vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-5 md:p-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-teal-400 to-amber-400 text-slate-900 flex items-center justify-center">
                <FiGithub size={22} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">
                  GitHub Repository Analyzer
                </h2>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)] mt-1">
                  Scan Files, Risks, And Suggestions
                </p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiX size={24} />
            </motion.button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAnalyze} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Paste GitHub repo URL (e.g., https://github.com/owner/repo)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-[var(--bg-0)] border border-[var(--line-soft)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <motion.button
                type="submit"
                disabled={loading || !repoUrl.trim()}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSearch size={16} />
                {loading ? "Analyzing..." : "Analyze"}
              </motion.button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-500/12 border border-red-400/40 rounded-xl text-red-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </motion.div>
          )}

          {/* Results */}
          {repoResults && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Repository Info */}
              <div className="glass-sm p-4 rounded-xl">
                <h3 className="font-semibold mb-2">
                  {repoResults.repository.owner}/{repoResults.repository.repo}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Analyzed {repoResults.totalFilesAnalyzed} files
                </p>
              </div>

              {/* Files analyzed */}
              {repoResults.files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-teal-200">
                    Files Analyzed
                  </h4>
                  {repoResults.files.map((file, index) => (
                    <motion.div
                      key={index}
                      className="glass-sm p-3 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {file.language} • {file.linesOfCode} lines
                          </p>
                        </div>
                        <span className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded-full">
                          {file.issues.length} issues
                        </span>
                      </div>
                      {file.issues.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {file.issues.slice(0, 3).map((issue, i) => (
                            <p
                              key={i}
                              className="text-xs text-[var(--text-muted)]"
                            >
                              Line {issue.line}: {issue.message}
                            </p>
                          ))}
                          {file.issues.length > 3 && (
                            <p className="text-xs text-slate-500">
                              +{file.issues.length - 3} more issues
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!repoResults && !loading && !error && (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <p>Enter a GitHub repository URL to analyze</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RepoAnalyzer;
