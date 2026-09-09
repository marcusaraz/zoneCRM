import { useParams } from 'react-router-dom';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RECORD_SLUG_FIELD_NAME } from '@/object-record/record-show/utils/recordSlugRoutes';
import { RecordShowPageForParameters } from '~/pages/object-record/RecordShowPage';

// Zone CRM: /customer/:slug and /company/:slug open the person or company
// carrying that slug. An id in the slug's place opens the record directly.
export const RecordSlugPage = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { slug = '' } = useParams<{ slug: string }>();
  const isId = isValidUuid(slug);

  const { records, loading } = useFindManyRecords({
    objectNameSingular,
    filter: { [RECORD_SLUG_FIELD_NAME]: { eq: slug } },
    limit: 1,
    recordGqlFields: { id: true, [RECORD_SLUG_FIELD_NAME]: true },
    skip: isId || slug === '',
  });

  if (isId) {
    return (
      <RecordShowPageForParameters
        parameters={{ objectNameSingular, objectRecordId: slug }}
      />
    );
  }

  const record = records[0];

  if (!isDefined(record)) {
    return loading ? null : <WorkspaceRouteUnavailable />;
  }

  return (
    <RecordShowPageForParameters
      parameters={{ objectNameSingular, objectRecordId: record.id }}
    />
  );
};
