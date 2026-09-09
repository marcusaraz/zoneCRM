/**
 * Zone CRM: what a note or task card should actually print.
 *
 * An imported note's title is the first line of its own body, and the import signed
 * the body with the author's name. Printing all three means reading the same sentence
 * twice with the writer's name under it, so the title is dropped when the body already
 * opens with it, and the signature is dropped when the card names the author anyway.
 */
export const getActivityCardText = ({
  title,
  body,
  author,
}: {
  title: string | null | undefined;
  body: string;
  author: string | null | undefined;
}): { title: string; body: string } => {
  const lines = body.split('\n');

  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  const signature = (author ?? '').trim();

  if (
    signature !== '' &&
    lines.length > 0 &&
    lines[lines.length - 1].trim().replace(/^_|_$/g, '') === signature
  ) {
    lines.pop();
  }

  const cleanBody = lines.join('\n');

  // A title the import cut short ends in an ellipsis or a full stop; compare the stem.
  const stem = (title ?? '')
    .trim()
    .replace(/[.…]+$/, '')
    .trim();
  const opensWithTitle =
    stem !== '' &&
    cleanBody.trimStart().toLowerCase().startsWith(stem.toLowerCase());

  return {
    title: opensWithTitle ? '' : (title ?? '').trim(),
    body: cleanBody,
  };
};
