import { CoreObjectNameSingular } from 'twenty-shared/types';

/**
 * People first, then notes, then whatever else matched.
 *
 * Searching a CRM is nearly always looking for a person, and the next most
 * likely thing is something written about one. Ranking alone would sometimes
 * bury a person under a dozen tasks that happen to share a word.
 */
const PREFERRED_ORDER: string[] = [
  CoreObjectNameSingular.Person,
  CoreObjectNameSingular.Note,
];

const rankOf = (objectNameSingular: string): number => {
  const preferred = PREFERRED_ORDER.indexOf(objectNameSingular);

  return preferred === -1 ? PREFERRED_ORDER.length : preferred;
};

export const sortByPreferredObjectOrder = <
  T extends { objectNameSingular: string },
>(
  items: T[],
): T[] =>
  // Everything outside the preferred kinds keeps the order the search gave it.
  [...items].sort(
    (first, second) =>
      rankOf(first.objectNameSingular) - rankOf(second.objectNameSingular),
  );
