/**
 * App Component - Main application container
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { FiGithub } from "react-icons/fi";
import ChatBot from "./components/ChatBot";
import RepoAnalyzer from "./components/RepoAnalyzer";

const App = () => {
  const [repoAnalyzerOpen, setRepoAnalyzerOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="glass border-b border-white/10 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                className="text-3xl font-bold"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                *
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Code Reviewer
                </h1>
                <p className="text-xs text-slate-400">
                  Interactive Code Analysis
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setRepoAnalyzerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 glass-sm hover:bg-white/20 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Analyze GitHub repository"
              >
                <FiGithub size={18} />
                <span className="hidden sm:inline text-sm">Analyze Repo</span>
              </motion.button>

              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiGithub size={20} />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ChatBot - Takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <ChatBot />
      </div>

      {/* Repository Analyzer Modal */}
      <RepoAnalyzer
        isOpen={repoAnalyzerOpen}
        onClose={() => setRepoAnalyzerOpen(false)}
      />
    </div>
  );
};

export default App;
