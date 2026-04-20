/**
 * Sidebar Component - Conversation History and Management
 */

import { motion } from "framer-motion";
import { FiX, FiPlus, FiTrash2, FiMenu } from "react-icons/fi";

const Sidebar = ({
  isOpen,
  onToggle,
  conversations,
  currentId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="fixed top-5 left-5 z-50 flex items-center justify-center w-12 h-12 rounded-xl border border-[var(--line-soft)] bg-[rgba(11,21,36,0.92)] hover:bg-[rgba(20,34,55,0.98)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Sidebar"
      >
        <FiMenu size={20} className="text-teal-300" />
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: isOpen ? 0 : -400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-[85vw] max-w-80 md:w-80 bg-[rgba(7,14,25,0.96)] backdrop-blur-xl border-r border-[var(--line-soft)] z-40 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--line-soft)] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <FiMenu className="text-teal-300" />
            Conversations
          </h2>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-[rgba(29,43,67,0.95)] rounded-lg transition-colors"
          >
            <FiX size={20} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* New Conversation Button */}
        <motion.button
          onClick={onNewConversation}
          className="m-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 rounded-xl transition text-slate-900 font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={18} />
          New Chat
        </motion.button>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {conversations.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-8">
              <p>No conversations yet</p>
              <p className="text-xs mt-2">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <motion.div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-all group ${
                  currentId === conv.id
                    ? "bg-teal-500/15 border border-teal-300/40"
                    : "bg-[rgba(14,24,40,0.8)] hover:bg-[rgba(20,33,54,0.92)] border border-transparent"
                }`}
                whileHover={{ x: 4 }}
              >
                <div
                  onClick={() => onSelectConversation(conv.id)}
                  className="flex-1"
                >
                  {/* Conversation Title */}
                  <h3 className="text-sm font-medium text-[var(--text-main)] truncate">
                    {conv.title}
                  </h3>

                  {/* Metadata */}
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {conv.messageCount} messages
                  </p>

                  {/* Timestamp */}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </p>
                </div>

                {/* Delete Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-2 py-1 opacity-0 group-hover:opacity-100 bg-red-500/15 hover:bg-red-500/25 rounded transition-all text-red-300 text-xs"
                  whileHover={{ scale: 1.02 }}
                >
                  <FiTrash2 size={14} />
                  Delete
                </motion.button>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-[var(--line-soft)] text-xs text-[var(--text-muted)] space-y-1">
          <p>💡 Tip: Click on a conversation to load it</p>
          <p>All messages are saved automatically</p>
        </div>
      </motion.div>

      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
