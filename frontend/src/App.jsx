/**
 * App Component - Main application container
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import RepoAnalyzer from "./components/RepoAnalyzer";

const App = () => {
  const [repoAnalyzerOpen, setRepoAnalyzerOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="h-screen flex flex-col text-[var(--text-main)] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <motion.div
          className="absolute top-[-20%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-teal-400/15 blur-3xl"
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[-22%] right-[-12%] h-[30rem] w-[30rem] rounded-full bg-amber-400/15 blur-3xl"
          animate={{ x: [0, -50, 25, 0], y: [0, 20, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenRepoAnalyzer={() => setRepoAnalyzerOpen(true)}
      />

      <MainContent />

      <Footer />

      {/* Repository Analyzer Modal */}
      <RepoAnalyzer
        isOpen={repoAnalyzerOpen}
        onClose={() => setRepoAnalyzerOpen(false)}
      />
    </div>
  );
};

export default App;
