import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

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
  cursor: pointer;
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

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
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

type ActivityRecord = ObjectRecord & {
  createdBy?: { name?: string | null } | null;
  title?: string | null;
  bodyV2?: { blocknote?: string | null; markdown?: string | null } | null;
  status?: string | null;
  dueAt?: string | null;
};

export const EventRowActivityCard = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: 'note' | 'task';
  recordId: string;
}) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
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
      ...(objectNameSingular === 'task' ? { status: true, dueAt: true } : {}),
    },
  });

  if (!isDefined(record)) {
    return null;
  }

  const title = (record.title ?? '').trim();
  const body = (record.bodyV2?.markdown ?? '').trim();

  const meta =
    objectNameSingular === 'task'
      ? [record.status, record.dueAt ? record.dueAt.slice(0, 10) : null]
          .filter(isDefined)
          .join(' · ')
      : '';

  return (
    <StyledCard
      onClick={() =>
        openRecordInSidePanel({ recordId: record.id, objectNameSingular })
      }
    >
      {title !== '' && <StyledTitle>{title}</StyledTitle>}
      {meta !== '' && <StyledMeta>{meta}</StyledMeta>}
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
