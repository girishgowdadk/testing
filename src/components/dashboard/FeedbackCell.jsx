/**
 * FeedbackCell — displayed in each row of AuditResultsTable.
 *
 * Analyst view:
 *   - Shows the AI-generated corrective suggestion (ai_suggested_logic) from the
 *     rule suggestion, which is distinct from and more specific than the Action column.
 *   - Displays a persistent multi-turn chatbox so the analyst can generate an initial
 *     rule and continue refining it with follow-up messages.
 *   - The read-only Rule / Condition / Business Logic panel is shown in a collapsible
 *     section after a suggestion is generated.
 *
 * Admin view: compact read-only status badge only.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Loader2, Sparkles, MessageSquare, Send, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { generateRule, getSuggestionByAnalysisResult } from '../services/feedbackApi';
import { STATUS_STYLES, STATUS_LABELS } from '../../constants/feedbackStatus';

const FeedbackCell = ({ isAdmin, analysisResultId, fileId, rowNumber, engineCategory, aiSuggestedAction }) => {
  const [expanded, setExpanded] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Multi-turn conversation state — always starts empty, never restored from DB
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Admin view only: restore existing suggestion to show status badge.
  // Analyst view intentionally does NOT restore previous suggestions —
  // the feedback column always starts empty so old chats never reappear.
  useEffect(() => {
    if (!isAdmin || !analysisResultId) return;
    const fetchForAdmin = async () => {
      try {
        const existing = await getSuggestionByAnalysisResult(analysisResultId);
        if (existing) setSuggestion(existing);
      } catch {
        // no suggestion exists — badge stays hidden
      }
    };
    fetchForAdmin();
  }, [isAdmin, analysisResultId]);

  // Scroll to top of chat when new messages appear (newest is at top)
  const chatTopRef = useRef(null);
  useEffect(() => {
    if (chatTopRef.current) {
      chatTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Initial rule generation (first-time, from main input or chat)
  const handleGenerate = useCallback(async (inputText) => {
    const text = (inputText || description).trim();
    if (!text) {
      toast.error('Please describe the rule you want to generate.');
      return;
    }

    setIsGenerating(true);

    // Add the user message to chat history
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMsg]);
    setDescription('');
    setChatInput('');

    try {
      const result = await generateRule(text, analysisResultId, fileId, rowNumber, engineCategory);
      setSuggestion(result);
      setIsChatOpen(true);

      // Add the AI corrective suggestion to chat history
      const aiMsg = {
        role: 'assistant',
        content: result.ai_suggested_logic || 'Rule generated — see details below.',
        timestamp: new Date().toISOString(),
      };
      setChatHistory(prev => [...prev, aiMsg]);

      toast.success('Corrective suggestion generated! Awaiting admin review.');
    } catch (err) {
      console.error('Rule generation error:', err);
      const detail = err?.response?.data?.detail;
      const status = err?.response?.status;
      let msg;
      if (status === 500) {
        msg = 'Backend error. Please restart the server and try again.';
      } else if (typeof detail === 'object') {
        msg = detail?.message || 'Could not generate a suggestion. Try a more specific description.';
      } else {
        msg = detail || 'Could not generate a suggestion. Try a more specific description.';
      }
      // Add error message to chat
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: `⚠ ${msg}`, timestamp: new Date().toISOString(), isError: true },
      ]);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [description, analysisResultId, fileId, rowNumber, engineCategory]);

  // Follow-up chat: send a new description to refine the suggestion
  const handleChatSend = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isGenerating) return;
    await handleGenerate(text);
  }, [chatInput, isGenerating, handleGenerate]);

  // ─────────────────────────────────────────────────────
  // ADMIN VIEW — read-only status badge only
  // ─────────────────────────────────────────────────────
  if (isAdmin) {
    if (!suggestion) {
      return (
        <span className="text-[11px] text-slate-300 font-medium italic">No rule submitted</span>
      );
    }
    return (
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${STATUS_STYLES[suggestion.status] || STATUS_STYLES.pending}`}>
        {STATUS_LABELS[suggestion.status] || suggestion.status}
      </span>
    );
  }

  // ─────────────────────────────────────────────────────
  // ANALYST VIEW
  // ─────────────────────────────────────────────────────
  return (
    <div className="space-y-2 min-w-[260px]">

      {/* ── No suggestion yet: show initial description input ── */}
      {!suggestion && chatHistory.length === 0 && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Describe a corrective rule…"
            disabled={isGenerating}
            className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-300 disabled:opacity-50 font-medium"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !description.trim()}
            title="Generate Corrective Suggestion"
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-sm shadow-indigo-500/20 flex-shrink-0"
          >
            {isGenerating
              ? <Loader2 size={14} className="animate-spin" />
              : <Sparkles size={14} />
            }
          </button>
        </div>
      )}

      {/* ── Suggestion exists: AI Corrective Logic card ── */}
      {suggestion && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bot size={10} className="text-indigo-500 flex-shrink-0" />
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                AI Corrective Suggestion
              </span>
            </div>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${STATUS_STYLES[suggestion.status] || STATUS_STYLES.pending}`}>
              {STATUS_LABELS[suggestion.status] || suggestion.status}
            </span>
          </div>

          {/* The new AI-generated corrective suggestion (ai_suggested_logic), NOT the Action column */}
          {suggestion.ai_suggested_logic && (
            <p className="text-[11px] text-indigo-800 font-medium leading-relaxed bg-white border border-indigo-100 rounded-lg px-2 py-1.5">
              {suggestion.ai_suggested_logic}
            </p>
          )}

          {/* Rule name */}
          {suggestion.rule_name && (
            <p className="text-xs font-bold text-indigo-700">{suggestion.rule_name}</p>
          )}

          {/* Collapsible details */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-600 font-bold"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Hide details' : 'Show rule details'}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div>
                  <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Condition</p>
                  <code className="block text-[10px] font-mono bg-white border border-indigo-100 rounded-lg px-2 py-1.5 text-slate-500 break-all">
                    {suggestion.rule_condition || 'No condition generated'}
                  </code>
                </div>
                <div>
                  <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Engine Business Logic</p>
                  <p className="text-[10px] bg-white border border-indigo-100 rounded-lg px-2 py-1.5 text-slate-600 whitespace-pre-line">
                    {suggestion.business_logic || 'No matching engine rule found for this category'}
                  </p>
                </div>
                {suggestion.admin_reasoning && (
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Admin Note</p>
                    <p className="text-[10px] bg-white border border-indigo-100 rounded-lg px-2 py-1.5 text-slate-600">
                      {suggestion.admin_reasoning}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Multi-turn chat section (open after first generation, or toggle) ── */}
      {chatHistory.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
          {/* Chat header / toggle */}
          <button
            onClick={() => setIsChatOpen(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <MessageSquare size={10} className="text-indigo-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Feedback Chat ({chatHistory.length} message{chatHistory.length !== 1 ? 's' : ''})
              </span>
            </div>
            {isChatOpen ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
          </button>

          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {/* Message history — newest message at top */}
                <div className="max-h-[200px] overflow-y-auto p-2 space-y-2">
                  <div ref={chatTopRef} />
                  {[...chatHistory].reverse().map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-xl px-2.5 py-1.5 text-[10px] leading-relaxed font-medium ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : msg.isError
                            ? 'bg-rose-50 border border-rose-100 text-rose-700 rounded-bl-sm'
                            : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Follow-up input */}
                <div className="border-t border-slate-100 p-2 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    placeholder="Refine or add more context…"
                    disabled={isGenerating}
                    className="flex-1 text-[11px] px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-300 disabled:opacity-50 font-medium"
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={isGenerating || !chatInput.trim()}
                    title="Send follow-up"
                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-40 flex-shrink-0"
                  >
                    {isGenerating
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Send size={12} />
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FeedbackCell;
