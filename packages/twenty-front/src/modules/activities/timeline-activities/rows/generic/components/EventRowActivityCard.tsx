import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { getActivityCardText } from '@/activities/utils/getActivityCardText';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// Zone CRM: a note or a task shown in the timeline as itself, the first lines
// of what was written, instead of a "linked a related note" line. The name is
// on the row above and is not repeated here.

// C29, Marcus 14 September 2026: six lines of the note, not a hundred pixels.
// Six is enough to know whether this is the one you are looking for and few
// enough that the next entry is still on the screen. Lines rather than pixels
// because a line is what a reader counts.
const COLLAPSED_LINES = 6;
const LINE_HEIGHT = 1.5;
const COLLAPSED_HEIGHT_EM = COLLAPSED_LINES * LINE_HEIGHT;

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

// Six lines of body text. A heading or a list item is taller than a sentence,
// so a note that opens with one shows fewer of them; six lines of prose is the
// promise, and prose is what nearly every note is.
const StyledBody = styled.div<{ expanded: boolean; clickable: boolean }>`
  color: ${themeCssVariables.font.color.secondary};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'auto')};
  line-break: anywhere;
  line-height: ${LINE_HEIGHT};
  max-height: ${({ expanded }) =>
    expanded ? 'none' : `${COLLAPSED_HEIGHT_EM}em`};
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
// how a reader knows there is more without being told. C29: over the last line,
// so the line above it is read and not guessed at.
const StyledFade = styled.div`
  background: linear-gradient(
    to bottom,
    ${themeCssVariables.background.transparent.lighter},
    ${themeCssVariables.background.secondary}
  );
  bottom: 0;
  height: ${LINE_HEIGHT}em;
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
      const lineHeight =
        parseFloat(getComputedStyle(element).lineHeight) ||
        LINE_HEIGHT * parseFloat(getComputedStyle(element).fontSize);

      setIsLong(element.scrollHeight > lineHeight * COLLAPSED_LINES + 2);
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

  // The name is said once, on the row above this card, so the card prints what
  // the row cannot: the body, with the line the row already carries taken off
  // the front and the imported signature taken off the end. A note whose whole
  // content is that one line keeps it, because a card with nothing in it is
  // worse than a line read twice.
  const written = (record.bodyV2?.markdown ?? '').trim();
  const trimmed = getActivityCardText({
    title: record.title,
    body: written,
    author: record.createdBy?.name,
    keepTitle: true,
  }).body.trim();
  const body = trimmed !== '' ? trimmed : written;

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
          clickable={isLong && !expanded}
          ref={bodyRef}
          // C29: the note opens where it is, by clicking it or by the words
          // under it. A link in the note is still a link, and text somebody is
          // half way through selecting is not a click, so neither opens it.
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();

            if (!isLong || expanded) {
              return;
            }

            const target = clickEvent.target as HTMLElement;

            if (target.closest('a') !== null) {
              return;
            }

            if ((window.getSelection()?.toString() ?? '') !== '') {
              return;
            }

            setExpanded(true);
          }}
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
