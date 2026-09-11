/**
 * The pipeline, in the order a customer travels it.
 *
 * The colours run from the cool end to the warm one as the relationship
 * hardens, and the two ways out of the pipeline are set apart at the end.
 */
export const DASHBOARD_LEAD_STAGES = [
  { key: 'LEAD', tone: 'var(--t-tag-text-gray)' },
  { key: 'INFORMED', tone: 'var(--t-tag-text-sky)' },
  { key: 'OPPORTUNITY', tone: 'var(--t-tag-text-blue)' },
  { key: 'CONTRACT', tone: 'var(--t-tag-text-purple)' },
  { key: 'CUSTOMER', tone: 'var(--t-tag-text-green)' },
  { key: 'CHURN', tone: 'var(--t-tag-text-red)' },
  { key: 'OPT_OUT', tone: 'var(--t-tag-text-orange)' },
] as const;
