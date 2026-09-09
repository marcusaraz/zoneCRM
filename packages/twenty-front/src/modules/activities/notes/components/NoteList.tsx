import { styled } from '@linaria/react';

import { type Note } from '@/activities/types/Note';
import { FieldDescriptionTooltipProvider } from '@/object-record/record-field/ui/components/FieldDescriptionTooltipProvider';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NoteTile } from './NoteTile';

type NoteListProps = {
  notes: Note[];
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// Zone CRM: one note under the other, newest first, rather than a grid of
// equal boxes; a note reads like a diary entry, not a tile.
const StyledNoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

export const NoteList = ({ notes }: NoteListProps) => {
  return (
    <>
      {notes.length > 0 && (
        <FieldDescriptionTooltipProvider>
          <StyledContainer>
            <StyledNoteContainer>
              {notes.map((note) => (
                <NoteTile
                  key={note.id}
                  note={note}
                  isSingleNote={notes.length === 1}
                />
              ))}
            </StyledNoteContainer>
          </StyledContainer>
        </FieldDescriptionTooltipProvider>
      )}
    </>
  );
};
