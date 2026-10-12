/**
 * API helpers for the rule feedback / thumbs-up / thumbs-down workflow.
 *
 * Rule suggestions come from two sources, both landing in the same pending
 * queue for admin review: automatic (right after analysis, for mismatched
 * rows) and manual (analyst types a description via generateRule below,
 * typically for rows without an auto-suggestion already).
 */
import api from './api';

const BASE = '/api/v1/feedback';

/**
 * Analyst: submit a plain-English description → get back an AI-generated rule.
 * @param {string} description
 * @param {string|null} analysisResultId - Optional FK to link rule to specific analysis row
 * @param {string|null} fileId - The current FileAnalysis id (which upload run this row is from)
 * @param {number|null} rowNumber - 1-based row position within that file
 * @param {string|null} engineCategory - The Engine Category of the mismatch row (e.g. "Price Mismatch | GR Pending").
 *   Used by the backend to look up the actual engine violation rule(s) and display them as Business Logic.
 * @returns {Promise<object>} suggestion object
 */
export async function generateRule(description, analysisResultId = null, fileId = null, rowNumber = null, engineCategory = null) {
  const res = await api.post(`${BASE}/generate-rule`, {
    description,
    analysis_result_id: analysisResultId,
    file_id: fileId,
    row_number: rowNumber,
    engine_category: engineCategory,
  });
  return res.data.data;
}

/**
 * Admin: fetch rule suggestions, optionally filtered by status.
 * @param {string|null} status - 'pending' (includes regenerated) or 'approved'. Omit for all.
 * @returns {Promise<object[]>}
 */
export async function listSuggestions(status = null) {
  const res = await api.get(`${BASE}/`, { params: status ? { status } : {} });
  return res.data.data;
}

/**
 * Analyst: submit all of a file's generated rules for admin review.
 * Sends one summary email to admins; safe to call more than once (idempotent).
 * @param {string} fileId - The FileAnalysis id for the current upload run
 * @returns {Promise<object>} { already_notified, pending_count, email_sent, submitted_at }
 */
export async function submitForReview(fileId) {
  const res = await api.post(`${BASE}/submit-for-review`, { file_id: fileId });
  return res.data.data;
}

/**
 * Admin: approve a suggestion (thumbs-up). Saves the rule to rules.json.
 * @param {string} suggestionId
 * @param {object} [edits] - Optional admin corrections applied before saving.
 *   Any field left out keeps the AI-suggested value.
 * @param {string} [edits.ruleName]
 * @param {string} [edits.ruleCondition]
 * @param {string} [edits.violationMessage]
 * @param {string} [edits.severity]
 * @returns {Promise<object>} updated suggestion
 */
export async function approveSuggestion(suggestionId, edits = {}) {
  const res = await api.post(`${BASE}/${suggestionId}/approve`, {
    rule_name: edits.ruleName,
    rule_condition: edits.ruleCondition,
    violation_message: edits.violationMessage,
    severity: edits.severity,
  });
  return res.data.data;
}

/**
 * Admin: reject a suggestion (thumbs-down) with reasoning. Triggers AI regeneration.
 * @param {string} suggestionId
 * @param {string} adminReasoning
 * @returns {Promise<object>} updated suggestion with regenerated rule
 */
export async function rejectSuggestion(suggestionId, adminReasoning) {
  const res = await api.post(`${BASE}/${suggestionId}/reject`, {
    admin_reasoning: adminReasoning,
  });
  return res.data.data;
}

/**
 * Get a single suggestion by ID.
 * @param {string} suggestionId
 * @returns {Promise<object>}
 */
export async function getSuggestion(suggestionId) {
  const res = await api.get(`${BASE}/${suggestionId}`);
  return res.data.data;
}

/**
 * Get suggestion by analysis result ID (for persistence on page refresh).
 * @param {string} analysisResultId
 * @returns {Promise<object|null>} suggestion object or null if not found
 */
export async function getSuggestionByAnalysisResult(analysisResultId) {
  const res = await api.get(`${BASE}/analysis/${analysisResultId}`);
  return res.data.data;
}
