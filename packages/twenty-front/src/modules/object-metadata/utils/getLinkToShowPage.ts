import { CoreObjectNameSingular } from 'twenty-shared/types';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { isDefined } from 'twenty-shared/utils';

import {
  getRecordSlugPath,
  RECORD_SLUG_FIELD_NAME,
} from '@/object-record/record-show/utils/recordSlugRoutes';

export const getLinkToShowPage = (
  objectNameSingular: string,
  record: Partial<ObjectRecord>,
) => {
  const basePathToShowPage = getBasePathToShowPage({
    objectNameSingular,
  });

  const isWorkspaceMemberObjectMetadata =
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember;

  if (objectNameSingular === CoreObjectNameSingular.NoteTarget) {
    return (
      getBasePathToShowPage({
        objectNameSingular: CoreObjectNameSingular.Note,
      }) + record.note?.id
    );
  }

  if (objectNameSingular === CoreObjectNameSingular.TaskTarget) {
    return (
      getBasePathToShowPage({
        objectNameSingular: CoreObjectNameSingular.Task,
      }) + record.task?.id
    );
  }

  // Zone CRM: a person or company with a slug is linked by it.
  const slug = record[RECORD_SLUG_FIELD_NAME];

  if (typeof slug === 'string' && slug !== '') {
    const slugPath = getRecordSlugPath(objectNameSingular, slug);

    if (isDefined(slugPath)) {
      return slugPath;
    }
  }

  const linkToShowPage =
    isWorkspaceMemberObjectMetadata || !record.id
      ? ''
      : `${basePathToShowPage}${record.id}`;

  return linkToShowPage;
};
