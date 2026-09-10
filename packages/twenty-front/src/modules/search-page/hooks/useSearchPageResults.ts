import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SEARCH_PAGE_DEBOUNCE_MS } from '@/search-page/constants/SearchPageDebounceMs';
import { SEARCH_PAGE_RESULT_LIMIT } from '@/search-page/constants/SearchPageResultLimit';
import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type SearchPageResult = {
  id: string;
  recordId: string;
  label: string;
  imageUrl?: string | null;
  objectNameSingular: string;
  objectLabelSingular: string;
  avatarType: 'squared' | 'rounded';
};

export type SearchPageGroup = {
  objectNameSingular: string;
  objectLabelPlural: string;
  results: SearchPageResult[];
};

export type SearchPageCount = {
  objectNameSingular: string;
  objectLabelPlural: string;
  count: number;
};

// Companies wear a square badge, everything else a round one, the same way they
// do everywhere else in the product.
const getAvatarType = (objectNameSingular: string) =>
  objectNameSingular === CoreObjectNameSingular.Company
    ? ('squared' as const)
    : ('rounded' as const);

/**
 * Two searches, one for the page and one for the tabs.
 *
 * The unfiltered search decides what the tabs say, so their counts stay put when
 * a tab is picked. Picking one runs a second search against that object alone,
 * which is what lets a search for a common surname go past the handful of people
 * that would otherwise be crowded out by everything else that matched.
 */
export const useSearchPageResults = ({
  query,
  objectNameSingular,
}: {
  query: string;
  objectNameSingular: string | null;
}) => {
  const [debouncedQuery] = useDebounce(query.trim(), SEARCH_PAGE_DEBOUNCE_MS);
  const hasQuery = debouncedQuery !== '';

  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const everySearchableObject = useSearchableObjectNameSingulars();

  const { searchRecords: everyRecord, loading: isLoadingEveryRecord } =
    useObjectRecordSearchRecords({
      objectNameSingulars: everySearchableObject,
      searchInput: debouncedQuery,
      limit: SEARCH_PAGE_RESULT_LIMIT,
      skip: !hasQuery,
    });

  const { searchRecords: recordsOfOneType, loading: isLoadingOneType } =
    useObjectRecordSearchRecords({
      objectNameSingulars: isDefined(objectNameSingular)
        ? [objectNameSingular]
        : [],
      searchInput: debouncedQuery,
      limit: SEARCH_PAGE_RESULT_LIMIT,
      skip: !hasQuery || !isDefined(objectNameSingular),
    });

  const toResult = useMemo(
    () =>
      (searchRecord: {
        recordId: string;
        label: string;
        imageUrl?: string | null;
        objectNameSingular: string;
        objectLabelSingular: string;
      }): SearchPageResult => ({
        id: searchRecord.recordId,
        recordId: searchRecord.recordId,
        label: searchRecord.label,
        imageUrl: searchRecord.imageUrl,
        objectNameSingular: searchRecord.objectNameSingular,
        objectLabelSingular: searchRecord.objectLabelSingular,
        avatarType: getAvatarType(searchRecord.objectNameSingular),
      }),
    [],
  );

  const labelPluralOf = useMemo(
    () => (nameSingular: string, fallback: string) =>
      readableObjectMetadataItems.find(
        (item) => item.nameSingular === nameSingular,
      )?.labelPlural ?? fallback,
    [readableObjectMetadataItems],
  );

  // The tabs, in the order the search itself ranked them: whichever kind of
  // record matched best comes first.
  const counts: SearchPageCount[] = useMemo(() => {
    const byObject = new Map<string, SearchPageCount>();

    for (const searchRecord of everyRecord) {
      const existing = byObject.get(searchRecord.objectNameSingular);

      if (isDefined(existing)) {
        existing.count += 1;
        continue;
      }

      byObject.set(searchRecord.objectNameSingular, {
        objectNameSingular: searchRecord.objectNameSingular,
        objectLabelPlural: labelPluralOf(
          searchRecord.objectNameSingular,
          searchRecord.objectLabelSingular,
        ),
        count: 1,
      });
    }

    return [...byObject.values()];
  }, [everyRecord, labelPluralOf]);

  const groups: SearchPageGroup[] = useMemo(() => {
    const source = isDefined(objectNameSingular)
      ? recordsOfOneType
      : everyRecord;
    const byObject = new Map<string, SearchPageGroup>();

    for (const searchRecord of source) {
      const group = byObject.get(searchRecord.objectNameSingular);
      const result = toResult(searchRecord);

      if (isDefined(group)) {
        group.results.push(result);
        continue;
      }

      byObject.set(searchRecord.objectNameSingular, {
        objectNameSingular: searchRecord.objectNameSingular,
        objectLabelPlural: labelPluralOf(
          searchRecord.objectNameSingular,
          searchRecord.objectLabelSingular,
        ),
        results: [result],
      });
    }

    return [...byObject.values()];
  }, [
    everyRecord,
    recordsOfOneType,
    objectNameSingular,
    toResult,
    labelPluralOf,
  ]);

  const results = useMemo(
    () => groups.flatMap((group) => group.results),
    [groups],
  );

  const loading = isDefined(objectNameSingular)
    ? isLoadingOneType || isLoadingEveryRecord
    : isLoadingEveryRecord;

  return {
    counts,
    groups,
    results,
    hasQuery,
    loading,
    // A search that has been answered and found nothing, as opposed to one that
    // has not been asked or not yet come back.
    noResults: hasQuery && !loading && results.length === 0,
    totalCount: counts.reduce((total, count) => total + count.count, 0),
  };
};
