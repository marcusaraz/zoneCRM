import { styled } from '@linaria/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ActivityBody } from '@/activities/components/ActivityBody';
import { ActivityCardActions } from '@/activities/components/ActivityCardActions';
import { ActivityFieldsEditor } from '@/activities/components/ActivityFieldsEditor';
import { getActivityCardText } from '@/activities/utils/getActivityCardText';

// The editor is the side panel's own, loaded when a card is opened for
// writing and not before: it is the heaviest thing on the page and most cards
// are only read.
const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

// Marcus, 14 September 2026: a task or a note is edited where it is, in this
// card, and deleted from here, the way HubSpot does it. No panel from the
// right. The fields the brief orders are the ones offered for editing, in
// that order.
const TASK_FIELDS = [
  'dueAt',
  'reminder',
  'status',
  'taskType',
  'priority',
  'assignee',
];
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// Zone CRM: a note or a task shown in the timeline as itself, the first lines
// of what was written, instead of a "linked a related note" line. The name is
// on the row above and is not repeated here.

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

// The card's first line: what is due on the left, Edit and Delete on the
// right. A note has nothing due, so its first line is the two words alone.
const StyledHead = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  min-height: 18px;
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

// A field nobody has set says so in words. The house rule is no em dashes in
// anything a colleague reads, and a dash in a value column is a puzzle anyway.
const labelOf = (words: Record<string, string>, value?: string | null) =>
  (isDefined(value) ? words[value] : undefined) ?? 'Not set';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isGone, setIsGone] = useState(false);

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

  // The card fetches the task for itself, and the cells that edit it read the
  // record store, which is a different place. Everything the timeline had
  // already loaded was in the store and showed; the assignee was not, because
  // the timeline never asks for it, so Edit opened with Assignee empty and the
  // person picked did not appear until Edit was closed and the card read the
  // task again. What this card fetched goes into the store, so the cells and
  // the card are looking at one task and not two.
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    if (!isDefined(record)) {
      return;
    }

    upsertRecordsInStore({ partialRecords: [record] });
  }, [record, upsertRecordsInStore]);

  // Deleted from this card: the timeline row that pointed at it is Twenty's
  // and stays, but the card it opened has nothing left to show.
  if (isGone || !isDefined(record)) {
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
  const editorObjectName = objectNameSingular as
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;

  return (
    <StyledCard>
      {/* pm/briefs/task-model-hubspot.md: the due date and its time first,
          then the reminder, then a hairline, then the four small fields. A
          date that has passed on a task nobody has finished is the one thing
          on this card that is allowed to be red. */}
      <StyledHead>
        {isTask && isDefined(due) ? (
          <StyledDue overdue={due.isOverdue && record.status !== 'DONE'}>
            {due.isOverdue && record.status !== 'DONE'
              ? `Overdue: ${due.text}`
              : due.text}
          </StyledDue>
        ) : (
          <span />
        )}
        <ActivityCardActions
          objectNameSingular={objectNameSingular}
          recordId={recordId}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onDeleted={() => setIsGone(true)}
        />
      </StyledHead>

      {isTask && isEditing && (
        <ActivityFieldsEditor
          objectNameSingular="task"
          recordId={recordId}
          fieldNames={TASK_FIELDS}
        />
      )}

      {isTask && !isEditing && (
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
            <StyledFieldValue>{assignee || 'Nobody'}</StyledFieldValue>
          </StyledField>
        </StyledFields>
      )}
      {isEditing ? (
        <Suspense fallback={null}>
          <ActivityRichTextEditor
            activityId={recordId}
            activityObjectNameSingular={editorObjectName}
            shouldSizeToContent
          />
        </Suspense>
      ) : (
        body !== '' && <ActivityBody markdown={body} />
      )}
    </StyledCard>
  );
};
