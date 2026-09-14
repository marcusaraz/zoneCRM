import { isDefined } from 'twenty-shared/utils';

import { getActivityPreview } from '@/activities/utils/getActivityPreview';

// Zone CRM: a note or task is named after its first line.
//
// A note opens on its body rather than its title, so nobody types a title and
// almost none of them have one. A record with no name is not merely untidy:
// it has nothing to show in the Notes list, nothing to match in search, and
// nothing for the timeline to draw, so the note somebody just wrote reads as an
// empty line on the record it was written on.
//
// The first line of what was written is what a person would have typed anyway,
// so it is taken rather than asked for. A title somebody did type is never
// touched.

const MAXIMUM_LENGTH = 72;

export const getTitleFromActivityBody = (
  blocknote: string | null | undefined,
  markdown?: string | null,
): string => {
  const text = isDefined(blocknote)
    ? getActivityPreview(blocknote)
    : (markdown ?? '');

  const firstLine = text
    .split('\n')
    .map((line) => line.replace(/^[#>\-*\s]+/, '').trim())
    .find((line) => line !== '');

  if (!isDefined(firstLine)) {
    return '';
  }

  if (firstLine.length <= MAXIMUM_LENGTH) {
    return firstLine;
  }

  // Cut at a word rather than mid-word, unless the first word is longer than
  // the whole allowance.
  const cut = firstLine.slice(0, MAXIMUM_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');

  return `${(lastSpace > MAXIMUM_LENGTH / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};
