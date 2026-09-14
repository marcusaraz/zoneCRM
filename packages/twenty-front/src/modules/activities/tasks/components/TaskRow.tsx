import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { type Task } from '@/activities/types/Task';
import { getActivityCardText } from '@/activities/utils/getActivityCardText';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { EventRowActivityCard } from '@/activities/timeline-activities/rows/generic/components/EventRowActivityCard';
import { useContext, useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconCalendar, IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { Checkbox, CheckboxShape } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { beautifyExactDate, hasDatePassed } from '~/utils/date-utils';

const StyledChevron = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

// The detail opens under the row it belongs to, not beside it.
const StyledDetail = styled.div`
  cursor: default;
  margin-top: ${themeCssVariables.spacing[2]};
`;

// Zone CRM: a task reads like a note card, with the checkbox and the due date on the
// line that says who wrote it and when it is due.
const StyledRow = styled.div`
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledHead = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  width: 100%;
`;

const StyledHeadLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAuthorLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
`;

const StyledDueDate = styled.div<{ isPast: boolean }>`
  align-items: center;
  color: ${({ isPast }) =>
    isPast ? themeCssVariables.font.color.danger : 'inherit'};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

const StyledTaskTitle = styled.div<{ completed: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-break: anywhere;
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
`;

const StyledTaskBody = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  line-break: anywhere;
  overflow: hidden;
  white-space: pre-line;
`;

export const TaskRow = ({ task }: { task: Task }) => {
  const { theme } = useContext(ThemeContext);
  const { completeTask } = useCompleteTask(task);
  // C33, Marcus 14 September 2026: a task opens under its own row and a second
  // click closes it. The panel on the right is gone: the reader is already
  // looking at the task, and a panel puts a second copy of it somewhere else.
  const [isOpen, setIsOpen] = useState(false);

  const author = task.createdBy?.name ?? '';
  const { title, body } = getActivityCardText({
    title: task.title,
    body: getActivityPreview(task?.bodyV2?.blocknote ?? null),
    author,
    keepTitle: true,
  });

  const isDone = task.status === 'DONE';

  return (
    <StyledRow onClick={() => setIsOpen(!isOpen)}>
      <StyledHead>
        <StyledHeadLeft>
          <StyledChevron aria-expanded={isOpen}>
            {isOpen ? (
              <IconChevronUp size={theme.icon.size.md} />
            ) : (
              <IconChevronDown size={theme.icon.size.md} />
            )}
          </StyledChevron>
          <StyledCheckboxContainer onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={isDone}
              shape={CheckboxShape.Rounded}
              onCheckedChange={completeTask}
            />
          </StyledCheckboxContainer>
          <span>
            <StyledAuthorLabel>{t`Task`}</StyledAuthorLabel>
            {author !== '' ? ` ${t`by`} ${author}` : ''}
          </span>
        </StyledHeadLeft>
        {task.dueAt && (
          <StyledDueDate isPast={hasDatePassed(task.dueAt) && !isDone}>
            <IconCalendar size={theme.icon.size.md} />
            {beautifyExactDate(task.dueAt)}
          </StyledDueDate>
        )}
      </StyledHead>
      <StyledTaskTitle completed={isDone}>
        {title !== '' ? title : t`Task title`}
      </StyledTaskTitle>
      {!isOpen && body !== '' && <StyledTaskBody>{body}</StyledTaskBody>}
      {isOpen && (
        <StyledDetail onClick={(event) => event.stopPropagation()}>
          <EventRowActivityCard
            objectNameSingular={CoreObjectNameSingular.Task}
            recordId={task.id}
          />
        </StyledDetail>
      )}
    </StyledRow>
  );
};
