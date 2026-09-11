import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { getRecordSlugPath } from '@/object-record/record-show/utils/recordSlugRoutes';

export const fullNameOf = (
  name:
    | { firstName?: string | null; lastName?: string | null }
    | null
    | undefined,
): string =>
  [name?.firstName, name?.lastName]
    .filter((part) => part)
    .join(' ')
    .trim();

export const pathToPerson = (person: {
  id: string;
  slug?: string | null;
}): string =>
  getRecordSlugPath('person', person.slug ?? '') ??
  getAppPath(AppPath.RecordShowPage, {
    objectNameSingular: 'person',
    objectRecordId: person.id,
  });

// How long ago, in the shortest true form. A day old reads as a day, not as
// twenty six hours.
export const timeAgo = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }

  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);

  if (minutes < 60) {
    return `${Math.max(minutes, 1)}m`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.round(hours / 24);

  return days < 365 ? `${days}d` : `${Math.round(days / 365)}y`;
};
