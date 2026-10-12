/**
 * Shared status badge styles/labels for rule suggestions - used by both the
 * analyst's inline FeedbackCell and the Admin Rule Review page.
 */

export const STATUS_STYLES = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  approved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-rose-50 text-rose-700 border-rose-200',
  regenerated: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const STATUS_LABELS = {
  pending:     'Pending Review',
  approved:    'Approved',
  rejected:    'Rejected',
  regenerated: 'Regenerated',
};
