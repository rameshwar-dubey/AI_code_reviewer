import { motion } from "framer-motion";
import ChatBot from "./ChatBot";

const MainContent = () => {
  return (
    <main className="flex-1 min-h-0 w-full flex flex-col px-3 md:px-4 py-2 md:py-3">
      <motion.section
        className="mx-auto flex-1 min-h-0 w-full max-w-7xl flex flex-col"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatBot />
        </div>
      </motion.section>
    </main>
  );
};

export default MainContent;
