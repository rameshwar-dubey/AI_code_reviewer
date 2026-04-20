/**
 * Sidebar Component - Conversation History and Management
 */

import { motion } from "framer-motion";
import { FiX, FiPlus, FiTrash2, FiMessageCircle } from "react-icons/fi";

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
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle Sidebar"
      >
        <FiMessageCircle size={20} className="text-white" />
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: isOpen ? 0 : -400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-80 bg-slate-900 border-r border-white/10 z-40 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiMessageCircle className="text-blue-400" />
            Conversations
          </h2>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX size={20} className="text-slate-400" />
          </button>
        </div>

        {/* New Conversation Button */}
        <motion.button
          onClick={onNewConversation}
          className="m-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={18} />
          New Chat
        </motion.button>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {conversations.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No conversations yet</p>
              <p className="text-xs mt-2">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <motion.div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-all group ${
                  currentId === conv.id
                    ? "bg-blue-600/30 border border-blue-500/50"
                    : "bg-slate-800/50 hover:bg-slate-800 border border-transparent"
                }`}
                whileHover={{ x: 4 }}
              >
                <div
                  onClick={() => onSelectConversation(conv.id)}
                  className="flex-1"
                >
                  {/* Conversation Title */}
                  <h3 className="text-sm font-medium text-white truncate">
                    {conv.title}
                  </h3>

                  {/* Metadata */}
                  <p className="text-xs text-slate-400 mt-1">
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
                  className="mt-2 w-full flex items-center justify-center gap-2 px-2 py-1 opacity-0 group-hover:opacity-100 bg-red-600/20 hover:bg-red-600/40 rounded transition-all text-red-400 text-xs"
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
        <div className="p-4 border-t border-white/10 text-xs text-slate-400 space-y-1">
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
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};

export default Sidebar;
