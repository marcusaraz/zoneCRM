import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type Note } from '@/activities/types/Note';
import { getActivityCardText } from '@/activities/utils/getActivityCardText';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { beautifyExactDateTime } from '~/utils/date-utils';

const StyledCard = styled.div<{ isSingleNote: boolean }>`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`;

const StyledCardDetailsContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: start;
  padding: ${themeCssVariables.spacing[4]};
  width: calc(100% - ${themeCssVariables.spacing[8]});
`;

// Zone CRM: who wrote it and when, the way a CRM timeline reads.
const StyledNoteHead = styled.div`
  align-items: baseline;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  width: 100%;
`;

const StyledNoteAuthor = styled.div`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNoteAuthorLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledNoteDate = styled.div`
  flex-shrink: 0;
  white-space: nowrap;
`;

const StyledNoteTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCardContent = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 8;
  align-self: stretch;
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  line-break: anywhere;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
  width: 100%;
`;

export const NoteTile = ({
  note,
  isSingleNote,
}: {
  note: Note;
  isSingleNote: boolean;
}) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const author = note.createdBy?.name ?? '';
  const { title, body } = getActivityCardText({
    title: note.title,
    body: getActivityPreview(note?.bodyV2?.blocknote ?? null),
    author,
  });

  return (
    <StyledCard isSingleNote={isSingleNote}>
      <StyledCardDetailsContainer
        onClick={() =>
          openRecordInSidePanel({
            recordId: note.id,
            objectNameSingular: CoreObjectNameSingular.Note,
          })
        }
      >
        <StyledNoteHead>
          <StyledNoteAuthor>
            <StyledNoteAuthorLabel>{t`Note`}</StyledNoteAuthorLabel>
            {author !== '' ? ` ${t`by`} ${author}` : ''}
          </StyledNoteAuthor>
          <StyledNoteDate>
            {beautifyExactDateTime(note.createdAt)}
          </StyledNoteDate>
        </StyledNoteHead>
        {title !== '' && <StyledNoteTitle>{title}</StyledNoteTitle>}
        <StyledCardContent>{body}</StyledCardContent>
      </StyledCardDetailsContainer>
    </StyledCard>
  );
};
