/**
 * RuleReviewPage — dedicated Admin Rule Review page.
 *
 * Lists all rule suggestions awaiting review (status = pending/regenerated)
 * across every analyst-submitted file, with predefined Business Logic and
 * AI Suggested Logic shown side by side. The admin can edit the Rule Name,
 * Condition, Violation Message, and Severity before approving - any field
 * left as-is keeps the AI-suggested value. Approve/Reject act on a single
 * row and update only that row in place - no full page reload.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, Loader2, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '../components/layout/Layout';
import Navbar from '../components/layout/Navbar';
import ThumbsDownModal from '../components/modals/ThumbsDownModal';
import { listSuggestions, approveSuggestion, rejectSuggestion } from '../components/services/feedbackApi';
import { STATUS_STYLES, STATUS_LABELS } from '../constants/feedbackStatus';

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

const formatDate = (value) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
};

const fieldInputClass =
  'w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all font-medium';

export default function RuleReviewPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [edits, setEdits] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listSuggestions('pending');
      const list = Array.isArray(data) ? data : [];
      setSuggestions(list);
      setEdits(
        Object.fromEntries(
          list.map((s) => [
            s.id,
            {
              ruleName: s.rule_name || '',
              ruleCondition: s.rule_condition || '',
              violationMessage: s.violation_message || '',
              severity: s.severity || 'medium',
            },
          ])
        )
      );
    } catch (err) {
      console.error('Failed to load pending rule suggestions:', err);
      toast.error('Failed to load pending rules for review.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const updateRow = (updated) => {
    setSuggestions((prev) => {
      const stillPending = updated.status === 'pending' || updated.status === 'regenerated';
      if (!stillPending) {
        return prev.filter((s) => s.id !== updated.id);
      }
      return prev.map((s) => (s.id === updated.id ? updated : s));
    });
    setEdits((prev) => ({
      ...prev,
      [updated.id]: {
        ruleName: updated.rule_name || '',
        ruleCondition: updated.rule_condition || '',
        violationMessage: updated.violation_message || '',
        severity: updated.severity || 'medium',
      },
    }));
  };

  const handleEditChange = (suggestionId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [suggestionId]: { ...prev[suggestionId], [field]: value },
    }));
  };

  const handleApprove = async (suggestion) => {
    setApprovingId(suggestion.id);
    try {
      const updated = await approveSuggestion(suggestion.id, edits[suggestion.id] || {});
      updateRow(updated);
      toast.success(`Rule "${updated.rule_name || updated.rule_id}" approved and added to engine_rules.json!`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Approval failed.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectSubmit = async (adminReasoning) => {
    if (!rejectTarget) return;
    setIsRejecting(true);
    try {
      const updated = await rejectSuggestion(rejectTarget.id, adminReasoning);
      updateRow(updated);
      setRejectTarget(null);
      if (updated.status === 'regenerated') {
        toast.success('Rule regenerated with your feedback! Review the updated condition.');
      } else {
        toast.warning('Rule rejected. Regeneration failed — try again.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Rejection failed.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col w-full min-h-screen">
        <Navbar />

        <main className="max-w-[1600px] mx-auto w-full p-8 pt-4 space-y-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="heading-modern text-brand-dark flex items-center gap-2">
              <ClipboardCheck size={16} />
              Rule Review
            </div>
            <h2 className="display-heading text-4xl">
              Pending <span className="text-gradient">Rule Suggestions</span>
            </h2>
            <p className="text-slate-400 font-medium italic">
              Review the AI-generated rules below - edit the Rule, Condition, Message, or Severity
              as needed before approving. Anything left unchanged keeps the AI's suggestion.
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="table-modern w-full">
              <thead>
                <tr>
                  <th className="text-left">File Name</th>
                  <th className="text-left">PO Number</th>
                  <th className="text-left">Row #</th>
                  <th className="text-left min-w-[180px]">Description</th>
                  <th className="text-left min-w-[160px]">Rule Name</th>
                  <th className="text-left min-w-[220px]">Condition</th>
                  <th className="text-left min-w-[180px]">Violation Message</th>
                  <th className="text-left min-w-[110px]">Severity</th>
                  <th className="text-left min-w-[200px]">Business Logic</th>
                  <th className="text-left min-w-[200px]">AI Suggested Logic</th>
                  <th className="text-left">Analyst</th>
                  <th className="text-left">Created</th>
                  <th className="text-left">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <tr>
                      <td colSpan={14} className="py-16 text-center text-slate-400">
                        <Loader2 className="animate-spin inline-block mr-2" size={18} />
                        Loading pending rules...
                      </td>
                    </tr>
                  ) : suggestions.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-16 text-center">
                        <p className="text-slate-600 font-black">No pending rules to review.</p>
                        <p className="text-slate-400 text-sm">Rules submitted by analysts will show up here.</p>
                      </td>
                    </tr>
                  ) : (
                    suggestions.map((s) => {
                      const edit = edits[s.id] || {};
                      const isBusy = approvingId === s.id || isRejecting;
                      return (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/50 transition-colors align-top"
                        >
                          <td className="py-3 text-xs font-bold text-slate-700">{s.file_name || 'N/A'}</td>
                          <td className="py-3">
                            {s.po_number ? (
                              <span className="inline-block font-black text-slate-900 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 whitespace-nowrap">
                                {s.po_number}
                              </span>
                            ) : (
                              <span className="text-xs italic text-slate-300">N/A</span>
                            )}
                          </td>
                          <td className="py-3 text-xs text-slate-500">{s.row_number ?? 'N/A'}</td>
                          <td className="py-3 text-xs text-slate-600 italic">"{s.description}"</td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={edit.ruleName ?? ''}
                              onChange={(e) => handleEditChange(s.id, 'ruleName', e.target.value)}
                              disabled={isBusy}
                              className={fieldInputClass}
                            />
                          </td>
                          <td className="py-3">
                            <textarea
                              value={edit.ruleCondition ?? ''}
                              onChange={(e) => handleEditChange(s.id, 'ruleCondition', e.target.value)}
                              disabled={isBusy}
                              rows={2}
                              className={`${fieldInputClass} font-mono resize-y`}
                            />
                          </td>
                          <td className="py-3">
                            <textarea
                              value={edit.violationMessage ?? ''}
                              onChange={(e) => handleEditChange(s.id, 'violationMessage', e.target.value)}
                              disabled={isBusy}
                              rows={2}
                              className={`${fieldInputClass} resize-y`}
                            />
                          </td>
                          <td className="py-3">
                            <select
                              value={edit.severity ?? 'medium'}
                              onChange={(e) => handleEditChange(s.id, 'severity', e.target.value)}
                              disabled={isBusy}
                              className={fieldInputClass}
                            >
                              {SEVERITY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 text-xs text-slate-600">
                            {s.business_logic || <span className="italic text-slate-300">Business Logic not available</span>}
                          </td>
                          <td className="py-3 text-xs text-slate-600">{s.ai_suggested_logic || 'N/A'}</td>
                          <td className="py-3 text-xs font-bold text-slate-700">{s.submitted_by_name || 'N/A'}</td>
                          <td className="py-3 text-xs text-slate-500">{formatDate(s.created_at)}</td>
                          <td className="py-3">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${STATUS_STYLES[s.status] || STATUS_STYLES.pending}`}>
                              {STATUS_LABELS[s.status] || s.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(s)}
                                disabled={isBusy}
                                title="Approve rule (with your edits above) — adds to engine_rules.json violation_rules"
                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 shadow-sm shadow-emerald-500/20"
                              >
                                {approvingId === s.id
                                  ? <Loader2 size={13} className="animate-spin" />
                                  : <ThumbsUp size={13} />
                                }
                              </button>
                              <button
                                onClick={() => setRejectTarget(s)}
                                disabled={isBusy}
                                title="Reject and provide feedback"
                                className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-all disabled:opacity-40 shadow-sm shadow-rose-500/20"
                              >
                                <ThumbsDown size={13} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <ThumbsDownModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        suggestion={rejectTarget}
        onSubmit={handleRejectSubmit}
        isLoading={isRejecting}
      />
    </Layout>
  );
}
