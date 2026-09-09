import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

// Zone CRM: a person or a company is addressed by a readable slug
// (/customer/nuran-aydin, /company/acme) as well as by its id. The slug lives
// in a text field on the record; an id in the slug's place still works.

export const RECORD_SLUG_FIELD_NAME = 'slug';

const RECORD_SLUG_ROUTES: ReadonlyArray<{
  objectNameSingular: string;
  path: AppPath;
}> = [
  { objectNameSingular: 'person', path: AppPath.CustomerPage },
  { objectNameSingular: 'company', path: AppPath.CompanyPage },
];

export const getRecordSlugRoutePath = (
  objectNameSingular: string,
): AppPath | undefined =>
  RECORD_SLUG_ROUTES.find(
    (route) => route.objectNameSingular === objectNameSingular,
  )?.path;

export const getRecordSlugPath = (
  objectNameSingular: string,
  slug: string,
): string | undefined => {
  const path = getRecordSlugRoutePath(objectNameSingular);

  return isDefined(path)
    ? path.replace(':slug', encodeURIComponent(slug))
    : undefined;
};

export type RecordShowPathMatch = {
  objectNameSingular: string;
  objectRecordId?: string;
  slug?: string;
};

// The record page, whichever of its addresses the location uses.
export const matchRecordShowPathname = (
  pathname: string,
): RecordShowPathMatch | null => {
  const byId = matchPath(AppPath.RecordShowPage, pathname);

  if (
    isDefined(byId?.params.objectNameSingular) &&
    isDefined(byId.params.objectRecordId)
  ) {
    return {
      objectNameSingular: byId.params.objectNameSingular,
      objectRecordId: byId.params.objectRecordId,
    };
  }

  for (const route of RECORD_SLUG_ROUTES) {
    const bySlug = matchPath(route.path, pathname);

    if (isDefined(bySlug?.params.slug)) {
      const slug = decodeURIComponent(bySlug.params.slug);

      return isValidUuid(slug)
        ? { objectNameSingular: route.objectNameSingular, objectRecordId: slug }
        : { objectNameSingular: route.objectNameSingular, slug };
    }
  }

  return null;
};

export const isRecordShowPathname = (pathname: string): boolean =>
  isDefined(matchRecordShowPathname(pathname));
