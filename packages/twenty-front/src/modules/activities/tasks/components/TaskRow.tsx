import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { type Task } from '@/activities/types/Task';
import { getActivityCardText } from '@/activities/utils/getActivityCardText';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconCalendar } from 'twenty-ui/icon';
import { Checkbox, CheckboxShape } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { beautifyExactDate, hasDatePassed } from '~/utils/date-utils';

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
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { completeTask } = useCompleteTask(task);

  const author = task.createdBy?.name ?? '';
  const { title, body } = getActivityCardText({
    title: task.title,
    body: getActivityPreview(task?.bodyV2?.blocknote ?? null),
    author,
    keepTitle: true,
  });

  const isDone = task.status === 'DONE';

  return (
    <StyledRow
      onClick={() =>
        openRecordInSidePanel({
          recordId: task.id,
          objectNameSingular: CoreObjectNameSingular.Task,
        })
      }
    >
      <StyledHead>
        <StyledHeadLeft>
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
      {body !== '' && <StyledTaskBody>{body}</StyledTaskBody>}
    </StyledRow>
  );
};
