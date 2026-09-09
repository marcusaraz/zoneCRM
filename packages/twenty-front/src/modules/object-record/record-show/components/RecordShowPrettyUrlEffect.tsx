import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import {
  getRecordSlugPath,
  matchRecordShowPathname,
  RECORD_SLUG_FIELD_NAME,
} from '@/object-record/record-show/utils/recordSlugRoutes';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';

// Zone CRM: a person or company opened by id shows its readable address
// instead, once the record (and so its slug) is known.
export const RecordShowPrettyUrlEffect = ({
  objectNameSingular,
  record,
}: {
  objectNameSingular: string;
  record: ObjectRecord | undefined;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const workspaceSurface = useWorkspaceSurface();

  const recordId = record?.id;
  const slugValue = record?.[RECORD_SLUG_FIELD_NAME];
  const slug = typeof slugValue === 'string' ? slugValue : '';

  useEffect(() => {
    if (workspaceSurface.type !== 'main' || slug === '') {
      return;
    }

    const match = matchRecordShowPathname(location.pathname);

    if (
      !isDefined(match) ||
      match.objectNameSingular !== objectNameSingular ||
      !isDefined(match.objectRecordId) ||
      match.objectRecordId !== recordId
    ) {
      return;
    }

    const prettyPath = getRecordSlugPath(objectNameSingular, slug);

    if (!isDefined(prettyPath) || prettyPath === location.pathname) {
      return;
    }

    navigate(
      { pathname: prettyPath, search: location.search, hash: location.hash },
      { replace: true },
    );
  }, [
    workspaceSurface.type,
    slug,
    recordId,
    objectNameSingular,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  return null;
};
