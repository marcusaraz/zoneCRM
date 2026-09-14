import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// Zone CRM: a note or a task shown in the timeline as itself (title and the
// first lines of the body) instead of a "linked a related note" line.

// Zone CRM: a hundred pixels is about four lines of a note, which is enough to
// know whether this is the one you are looking for and not enough to push the
// next entry off the screen.
const COLLAPSED_HEIGHT = 100;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow-wrap: anywhere;
  white-space: normal;
`;

// Cut by height rather than by line count: a note is headings and lists as well
// as sentences, and six of those lines is not six of these.
const StyledBody = styled.div<{ expanded: boolean }>`
  color: ${themeCssVariables.font.color.secondary};
  line-break: anywhere;
  max-height: ${({ expanded }) =>
    expanded ? 'none' : `${COLLAPSED_HEIGHT}px`};
  overflow: hidden;
  position: relative;
  width: 100%;

  // The renderer is shared with the AI panel, where a wide answer is allowed to
  // scroll sideways. A note on a record is not: the card has a width, the text
  // wraps inside it, and a horizontal scrollbar under somebody's note is a
  // piece of furniture nobody asked for. A long unbroken address is broken
  // rather than allowed to push the card.
  .markdown-section {
    overflow-x: hidden;
  }

  .markdown-section * {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
`;

// The last line fades into the card rather than stopping mid-letter, which is
// how a reader knows there is more without being told.
const StyledFade = styled.div`
  background: linear-gradient(
    to bottom,
    ${themeCssVariables.background.transparent.lighter},
    ${themeCssVariables.background.secondary}
  );
  bottom: 0;
  height: 32px;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
`;

// A date that has passed on a task nobody finished. MASTER.md keeps red for
// errors, and a promise already broken is the one thing on a record that
// qualifies.
const StyledDue = styled.div<{ overdue: boolean }>`
  color: ${({ overdue }) =>
    overdue
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// One row of small fields, label above value, wrapping when the card is narrow.
const StyledFields = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledFieldLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StyledFieldValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
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

// The words the select fields carry, so a card does not print SIXTY_MINUTES at
// somebody. They are the labels the Zone Core app gives those options; if a
// label changes there it changes here, which is a copy, but a copy of five
// words rather than a query per row of a timeline.
const REMINDERS: Record<string, string> = {
  NONE: 'No reminder',
  AT_TIME: 'At the time',
  FIFTEEN_MINUTES: '15 minutes before',
  ONE_HOUR: '1 hour before',
  ONE_DAY: '1 day before',
};

const STAGES: Record<string, string> = {
  TODO: 'Not started',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const TYPES: Record<string, string> = {
  TODO: 'To-do',
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
};

const PRIORITIES: Record<string, string> = {
  NONE: 'None',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const labelOf = (words: Record<string, string>, value?: string | null) =>
  (isDefined(value) ? words[value] : undefined) ?? '—';

/// The due date as the brief writes it: the day and the time, because a task
/// due "today" and a task due "today at 08:00" are different promises.
const readDueDate = (dueAt?: string | null) => {
  if (!isDefined(dueAt) || dueAt === '') {
    return null;
  }

  const when = new Date(dueAt);

  if (Number.isNaN(when.getTime())) {
    return null;
  }

  return {
    text: when.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isOverdue: when.getTime() < Date.now(),
  };
};

type ActivityRecord = ObjectRecord & {
  createdBy?: { name?: string | null } | null;
  title?: string | null;
  bodyV2?: { blocknote?: string | null; markdown?: string | null } | null;
  status?: string | null;
  dueAt?: string | null;
  reminder?: string | null;
  taskType?: string | null;
  priority?: string | null;
  assignee?: {
    name?: { firstName?: string | null; lastName?: string | null } | null;
  } | null;
};

export const EventRowActivityCard = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: 'note' | 'task';
  recordId: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Whether there is more to show is a question about the rendered height, so
  // it is asked of the element rather than guessed from the number of
  // characters. Markdown arrives asynchronously, so it is asked again when the
  // element changes size.
  useEffect(() => {
    const element = bodyRef.current;

    if (!isDefined(element) || typeof ResizeObserver === 'undefined') {
      return;
    }

    const measure = () => {
      setIsLong(element.scrollHeight > COLLAPSED_HEIGHT + 8);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const { record } = useFindOneRecord<ActivityRecord>({
    objectNameSingular,
    objectRecordId: recordId,
    recordGqlFields: {
      id: true,
      title: true,
      bodyV2: true,
      createdBy: true,
      ...(objectNameSingular === 'task'
        ? {
            status: true,
            dueAt: true,
            reminder: true,
            taskType: true,
            priority: true,
            assignee: true,
          }
        : {}),
    },
  });

  if (!isDefined(record)) {
    return null;
  }

  const title = (record.title ?? '').trim();
  const body = (record.bodyV2?.markdown ?? '').trim();

  const isTask = objectNameSingular === 'task';
  const due = readDueDate(record.dueAt);
  const assignee = [
    record.assignee?.name?.firstName,
    record.assignee?.name?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  // C33: the card IS the detail. It used to be a preview that opened the record
  // in a panel on the right, which Marcus called useless and unnecessary, and
  // he is right: the reader is already looking at the thing, and a panel puts
  // a second copy of it somewhere else.
  return (
    <StyledCard>
      {title !== '' && <StyledTitle>{title}</StyledTitle>}

      {/* pm/briefs/task-model-hubspot.md: the due date and its time first,
          then the reminder, then a hairline, then the four small fields. A
          date that has passed on a task nobody has finished is the one thing
          on this card that is allowed to be red. */}
      {isTask && isDefined(due) && (
        <StyledDue overdue={due.isOverdue && record.status !== 'DONE'}>
          {due.isOverdue && record.status !== 'DONE'
            ? `Overdue: ${due.text}`
            : due.text}
        </StyledDue>
      )}

      {isTask && (
        <StyledFields>
          <StyledField>
            <StyledFieldLabel>Reminder</StyledFieldLabel>
            <StyledFieldValue>
              {labelOf(REMINDERS, record.reminder)}
            </StyledFieldValue>
          </StyledField>
          <StyledField>
            <StyledFieldLabel>Stage</StyledFieldLabel>
            <StyledFieldValue>
              {labelOf(STAGES, record.status)}
            </StyledFieldValue>
          </StyledField>
          <StyledField>
            <StyledFieldLabel>Type</StyledFieldLabel>
            <StyledFieldValue>
              {labelOf(TYPES, record.taskType)}
            </StyledFieldValue>
          </StyledField>
          <StyledField>
            <StyledFieldLabel>Priority</StyledFieldLabel>
            <StyledFieldValue>
              {labelOf(PRIORITIES, record.priority)}
            </StyledFieldValue>
          </StyledField>
          <StyledField>
            <StyledFieldLabel>Assigned to</StyledFieldLabel>
            <StyledFieldValue>{assignee || '—'}</StyledFieldValue>
          </StyledField>
        </StyledFields>
      )}
      {body !== '' && (
        <StyledBody
          expanded={expanded}
          ref={bodyRef}
          // A link in the note is a link. Opening the record as well because
          // the click also reached the card would take the reader somewhere
          // they did not ask to go.
          onClick={(clickEvent) => clickEvent.stopPropagation()}
        >
          <LazyMarkdownRenderer text={body} />
          {!expanded && isLong && <StyledFade />}
        </StyledBody>
      )}
      {isLong && (
        <StyledMore
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </StyledMore>
      )}
    </StyledCard>
  );
};
