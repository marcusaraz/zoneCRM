import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

// Zone CRM: what was said on the call, under the call. A record of who rang
// whom and for how long answers none of the questions anyone asks a week later;
// the notes do. Opening the card puts the call in the side panel, where the
// notes field is the one you type into.

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledNotes = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  line-break: anywhere;
  white-space: pre-line;
`;

const StyledSummary = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-break: anywhere;
  white-space: pre-line;
`;

// An invitation, not a label: the card exists so that a call without notes
// still tells you where to put them.
const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

type PhoneCallRecord = ObjectRecord & {
  notes?: string | null;
  summary?: string | null;
};

export const EventRowPhoneCallCard = ({ recordId }: { recordId: string }) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const { record } = useFindOneRecord<PhoneCallRecord>({
    objectNameSingular: 'phoneCall',
    objectRecordId: recordId,
    recordGqlFields: { id: true, notes: true, summary: true },
  });

  if (!isDefined(record)) {
    return null;
  }

  const notes = (record.notes ?? '').trim();
  const summary = (record.summary ?? '').trim();

  return (
    <StyledCard
      onClick={() =>
        openRecordInSidePanel({
          recordId: record.id,
          objectNameSingular: 'phoneCall',
        })
      }
    >
      {notes !== '' ? (
        <StyledNotes>{notes}</StyledNotes>
      ) : (
        <StyledEmpty>{t`Write what was said`}</StyledEmpty>
      )}
      {summary !== '' && <StyledSummary>{summary}</StyledSummary>}
    </StyledCard>
  );
};
