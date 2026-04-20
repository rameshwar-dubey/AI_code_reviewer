import { motion } from "framer-motion";
import { FiGithub, FiMoon, FiSun } from "react-icons/fi";

const Navbar = ({ theme, onToggleTheme, onOpenRepoAnalyzer }) => {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full px-3 pt-3 md:px-4"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <nav className="glass px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              className="h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-2xl bg-gradient-to-br from-teal-400 to-amber-400 text-slate-900 font-bold text-xl flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,165,0.35)]"
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity }}
            >
              A
            </motion.div>
            <div className="min-w-0">
              <h1 className="truncate text-lg md:text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-300 via-slate-100 to-amber-300 bg-clip-text text-transparent">
                AI Code Reviewer
              </h1>
              <p className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-[0.16em]">
                Smart Code Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <motion.button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-[var(--line-soft)] bg-[rgba(11,21,36,0.85)] hover:bg-[rgba(20,34,55,0.95)] transition-colors"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <FiSun size={18} className="text-amber-300" />
              ) : (
                <FiMoon size={18} className="text-slate-700" />
              )}
            </motion.button>

            <motion.button
              onClick={onOpenRepoAnalyzer}
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-[var(--line-soft)] bg-[rgba(11,21,36,0.85)] hover:bg-[rgba(20,34,55,0.95)] transition-all text-[13px] md:text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Analyze GitHub repository"
            >
              <FiGithub size={18} className="text-teal-300" />
              <span className="hidden sm:inline">Analyze Repo</span>
            </motion.button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
