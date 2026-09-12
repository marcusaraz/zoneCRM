/**
 * The pipeline, in the order a deal travels it.
 *
 * The last one is not a stage so much as the end of the road, which is why it
 * is counted apart from the rest wherever "open" is meant.
 */
export const DASHBOARD_OPPORTUNITY_STAGES = [
  { key: 'RESEARCH_STAGE', tone: 'var(--t-tag-text-gray)' },
  { key: 'HOT_DEAL', tone: 'var(--t-tag-text-orange)' },
  { key: 'OFFER_IN_PLACE', tone: 'var(--t-tag-text-yellow)' },
  { key: 'MORTGAGE_OFFER', tone: 'var(--t-tag-text-sky)' },
  { key: 'PRE_PAYMENT', tone: 'var(--t-tag-text-blue)' },
  { key: 'CONVEYANCING', tone: 'var(--t-tag-text-purple)' },
  { key: 'EXCHANGE_OF_CONTRACTS', tone: 'var(--t-tag-text-turquoise)' },
  { key: 'COMPLETION', tone: 'var(--t-tag-text-green)' },
] as const;
