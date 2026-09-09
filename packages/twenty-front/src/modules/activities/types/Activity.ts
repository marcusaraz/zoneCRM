export type Activity = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  bodyV2?: {
    blocknote: string | null;
    markdown: string | null;
  };
  // Zone CRM: who wrote it, so a card can say so instead of repeating it in the body.
  createdBy?: {
    name?: string | null;
    source?: string | null;
  } | null;
};
