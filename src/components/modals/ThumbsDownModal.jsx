/**
 * ThumbsDownModal — admin provides reasoning before rejecting a rule.
 * The reasoning is sent to the backend which regenerates the rule with context.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ThumbsDown, AlertCircle, Loader2 } from 'lucide-react';

const ThumbsDownModal = ({ isOpen, onClose, suggestion, onSubmit, isLoading }) => {
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reasoning.trim()) {
      setError('Please provide your reasoning before rejecting.');
      return;
    }
    setError('');
    onSubmit(reasoning);
  };

  const handleClose = () => {
    setReasoning('');
    setError('');
    onClose();
  };

  if (!suggestion) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-modern" style={{ zIndex: 60 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-rose-50 px-8 py-6 border-b border-rose-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                  <ThumbsDown size={22} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-black text-slate-900 tracking-tight">
                    Reject Rule
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Provide feedback to improve the AI-generated rule
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Original condition preview */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Current AI-Generated Rule
                </p>
                <p className="text-sm font-bold text-slate-700 mb-1">
                  {suggestion.rule_name || 'Unnamed Rule'}
                </p>
                <code className="text-xs text-slate-500 font-mono block bg-white border border-slate-100 rounded-xl px-3 py-2 mt-2">
                  {suggestion.rule_condition || 'No condition generated'}
                </code>
              </div>

              {/* Reasoning textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Your Reasoning *
                </label>
                <textarea
                  value={reasoning}
                  onChange={(e) => {
                    setReasoning(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                  placeholder="Explain why this rule condition is incorrect and what it should check instead..."
                  rows={5}
                  className={`w-full p-4 bg-slate-50 border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:bg-white focus:border-rose-300 outline-none resize-none transition-all leading-relaxed disabled:opacity-50 ${
                    error ? 'border-rose-300' : 'border-slate-100'
                  }`}
                />
                {error && (
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 py-4 px-6 bg-slate-50 border border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !reasoning.trim()}
                  className="flex-1 py-4 px-6 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <ThumbsDown size={16} />
                      <span>Reject & Regenerate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ThumbsDownModal;
