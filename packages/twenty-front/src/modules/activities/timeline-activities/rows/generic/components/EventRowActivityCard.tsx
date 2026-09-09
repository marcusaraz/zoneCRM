import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

// Zone CRM: a note or a task shown in the timeline as itself (title and the
// first lines of the body) instead of a "linked a related note" line.

const PREVIEW_LINES = 6;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 560px;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledBody = styled.div<{ expanded: boolean }>`
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  line-break: anywhere;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${({ expanded }) => (expanded ? 'unset' : PREVIEW_LINES)};
  white-space: pre-line;
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMore = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0;
`;

type ActivityRecord = {
  id: string;
  title?: string | null;
  bodyV2?: { blocknote?: string | null; markdown?: string | null } | null;
  status?: string | null;
  dueAt?: string | null;
};

export const EventRowActivityCard = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: 'note' | 'task';
  recordId: string;
}) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const [expanded, setExpanded] = useState(false);

  const { record } = useFindOneRecord<ActivityRecord>({
    objectNameSingular,
    objectRecordId: recordId,
    recordGqlFields: {
      id: true,
      title: true,
      bodyV2: true,
      ...(objectNameSingular === 'task' ? { status: true, dueAt: true } : {}),
    },
  });

  if (!isDefined(record)) {
    return null;
  }

  const blocknote = record.bodyV2?.blocknote ?? null;
  const body = isDefined(blocknote)
    ? getActivityPreview(blocknote)
    : (record.bodyV2?.markdown ?? '');
  const isLong = body.split('\n').length > PREVIEW_LINES || body.length > 600;

  const meta =
    objectNameSingular === 'task'
      ? [record.status, record.dueAt ? record.dueAt.slice(0, 10) : null]
          .filter(isDefined)
          .join(' · ')
      : '';

  return (
    <StyledCard
      onClick={() =>
        openRecordInSidePanel({ recordId: record.id, objectNameSingular })
      }
    >
      {isDefined(record.title) && record.title !== '' && (
        <StyledTitle>{record.title}</StyledTitle>
      )}
      {meta !== '' && <StyledMeta>{meta}</StyledMeta>}
      {body !== '' && <StyledBody expanded={expanded}>{body}</StyledBody>}
      {isLong && (
        <StyledMore
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </StyledMore>
      )}
    </StyledCard>
  );
};
