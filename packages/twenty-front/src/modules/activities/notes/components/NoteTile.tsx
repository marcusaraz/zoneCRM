import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { ActivityBody } from '@/activities/components/ActivityBody';
import { type Note } from '@/activities/types/Note';
import { getActivityCardText } from '@/activities/utils/getActivityCardText';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
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

export const NoteTile = ({
  note,
  isSingleNote,
}: {
  note: Note;
  isSingleNote: boolean;
}) => {
  const author = note.createdBy?.name ?? '';
  // C29: the note is shown as it was written, so the body is the markdown and
  // not the flattened preview. The preview is still what decides whether the
  // title repeats the first line, because that comparison is about words and
  // not about formatting.
  const written = note.bodyV2?.markdown ?? '';
  const { title } = getActivityCardText({
    title: note.title,
    body: getActivityPreview(note?.bodyV2?.blocknote ?? null),
    author,
  });
  const { body } = getActivityCardText({
    title: note.title,
    body: written,
    author,
  });

  return (
    <StyledCard isSingleNote={isSingleNote}>
      {/* C33 and C29: no side panel. The reader is already looking at the
          note, and a panel puts a second copy of it somewhere else. */}
      <StyledCardDetailsContainer>
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
        {body.trim() !== '' && <ActivityBody markdown={body} />}
      </StyledCardDetailsContainer>
    </StyledCard>
  );
};
