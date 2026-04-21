import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      className="w-full shrink-0 px-3 pb-3 md:px-4 md:pb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <div className="glass px-4 py-2.5 text-center text-xs md:text-sm text-[var(--text-muted)]">
        © 2026 AI Code Reviewer | Built with ❤️
      </div>
    </motion.footer>
  );
};

export default Footer;
