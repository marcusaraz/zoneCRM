import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';

// Marcus, 14 September 2026: a note or a task is edited where it is, in the
// card that shows it, the way HubSpot does it, and it can be deleted from
// there. No panel sliding in from the right: the reader is already looking at
// the thing.
//
// Two quiet words on the card's top line. Edit turns into Done while the card
// is open for writing. Delete asks once, by turning into "Delete?" for a few
// seconds, and only a second click within that time deletes; a window in the
// middle of the page would be a bigger interruption than the mistake it
// guards against, and the second click is the same guard.

const ARMED_MS = 4000;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledAction = styled.button<{ isDanger: boolean }>`
  background: none;
  border: none;
  color: ${({ isDanger }) =>
    isDanger
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0;

  &:hover {
    color: ${({ isDanger }) =>
      isDanger
        ? themeCssVariables.color.red
        : themeCssVariables.font.color.primary};
  }
`;

type ActivityCardActionsProps = {
  objectNameSingular: 'note' | 'task';
  recordId: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onDeleted?: () => void;
};

export const ActivityCardActions = ({
  objectNameSingular,
  recordId,
  isEditing,
  onToggleEdit,
  onDeleted,
}: ActivityCardActionsProps) => {
  const [isArmed, setIsArmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { deleteOneRecord } = useDeleteOneRecord({ objectNameSingular });

  useEffect(() => {
    if (!isArmed) {
      return;
    }

    const timer = window.setTimeout(() => setIsArmed(false), ARMED_MS);

    return () => window.clearTimeout(timer);
  }, [isArmed]);

  const handleDelete = async (clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation();

    if (!isArmed) {
      setIsArmed(true);

      return;
    }

    setIsDeleting(true);

    try {
      await deleteOneRecord(recordId);
      onDeleted?.();
    } finally {
      setIsDeleting(false);
      setIsArmed(false);
    }
  };

  return (
    <StyledActions>
      <StyledAction
        type="button"
        isDanger={false}
        onClick={(clickEvent) => {
          clickEvent.stopPropagation();
          onToggleEdit();
        }}
      >
        {isEditing ? 'Done' : 'Edit'}
      </StyledAction>
      <StyledAction
        type="button"
        isDanger={isArmed}
        disabled={isDeleting}
        onClick={handleDelete}
      >
        {isDeleting ? 'Deleting' : isArmed ? 'Delete?' : 'Delete'}
      </StyledAction>
    </StyledActions>
  );
};
