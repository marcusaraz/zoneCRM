import { useEffect, useState } from 'react';

import { type DashboardChartSegment } from '@/dashboard/components/DashboardBarChart';
import { DASHBOARD_QUERIES } from '@/dashboard/graphql/dashboardQueries';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

// The ladder is read top down, so the colour weakens as the numbers do.
const TONES = [
  'var(--t-tag-text-blue)',
  'var(--t-tag-text-sky)',
  'var(--t-tag-text-turquoise)',
  'var(--t-tag-text-green)',
  'var(--t-tag-text-gray)',
];

/**
 * Who is carrying how much of the book.
 *
 * The names come from the data model rather than a list kept here, so somebody
 * joining or leaving changes the chart without changing the code. One count per
 * name means one request per name, asked all at once and outside the render,
 * because a hook cannot be called a different number of times each time.
 */
export const useDashboardOwners = () => {
  const apolloCoreClient = useApolloCoreClient();
  // Read the model rather than demand it: this runs on the first screen after
  // signing in, when the metadata has often not arrived yet, and the hook that
  // insists on it throws rather than waiting.
  const objectMetadataItemsWithFields = useAtomStateValue(
    objectMetadataItemsWithFieldsSelector,
  );
  const objectMetadataItem = objectMetadataItemsWithFields.find(
    (item) => item.nameSingular === 'person',
  );

  const [segments, setSegments] = useState<DashboardChartSegment[]>([]);

  const ownerField = objectMetadataItem?.fields?.find(
    (field) => field.name === 'owner',
  );
  const optionsKey = (ownerField?.options ?? [])
    .map((option) => option.value)
    .join(',');

  useEffect(() => {
    const options = optionsKey === '' ? [] : optionsKey.split(',');

    if (options.length === 0) {
      setSegments([]);

      return;
    }

    let isStale = false;

    const countEveryone = async () => {
      const counted = await Promise.all(
        options.map(async (value) => {
          const result = await apolloCoreClient.query({
            query: DASHBOARD_QUERIES.people,
            variables: { filter: { owner: { eq: value } } },
            fetchPolicy: 'cache-first',
          });

          const label =
            (ownerField?.options ?? []).find((option) => option.value === value)
              ?.label ?? value;

          return {
            key: value,
            label,
            count:
              (result.data as { people?: { totalCount?: number } } | undefined)
                ?.people?.totalCount ?? 0,
          };
        }),
      );

      if (isStale) {
        return;
      }

      setSegments(
        counted
          .filter((entry) => entry.count > 0)
          .sort((first, second) => second.count - first.count)
          .map((entry, index) => ({
            ...entry,
            tone: TONES[Math.min(index, TONES.length - 1)],
          })),
      );
    };

    countEveryone();

    return () => {
      isStale = true;
    };
    // The field's options are the only thing that changes what is asked for.
  }, [optionsKey, apolloCoreClient, ownerField]);

  const filterForOwner = (key: string | null) =>
    isDefined(key) ? { owner: { eq: key } } : null;

  return { segments, filterForOwner };
};
