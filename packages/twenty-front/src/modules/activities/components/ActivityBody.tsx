import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';

// C29, Marcus 14 September 2026: what somebody wrote, shown as they wrote it.
//
// Five lines of it, not a hundred pixels. It was six, and on 15 September he
// took one off: five is still enough to know whether this is the one you are
// looking for, and a timeline of notes stays a list rather than a wall. A line
// is what a reader counts. Anything longer fades into the card over its last
// visible line, which is how a reader knows there is more without being told,
// and opens where it is.
//
// One component because the timeline and the Notes tab are the same promise
// twice, so the number is changed here once and both follow.
const COLLAPSED_LINES = 5;
const LINE_HEIGHT = 1.5;
const COLLAPSED_HEIGHT_EM = COLLAPSED_LINES * LINE_HEIGHT;

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

  // The timeline sets nowrap on its rows, which is right for a row and wrong
  // for a note: it inherits all the way down here and sends a long sentence
  // out through the side of the card. This is the horizontal scrollbar Marcus
  // saw; hiding the scrollbar only hid the evidence. The note wraps.
  white-space: normal;

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

const StyledMore = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: 0;
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  width: 100%;
`;

type ActivityBodyProps = {
  markdown: string;
};

export const ActivityBody = ({ markdown }: ActivityBodyProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Whether there is more to show is a question about the rendered height, so
  // it is asked of the element rather than guessed from the number of
  // characters. Markdown arrives asynchronously, so it is asked again when the
  // text changes size.
  //
  // The text is measured and not the box around it. The box is the one with
  // the six-line ceiling on it, so it stops growing the moment there is
  // anything to notice, the observer never fires again, and "Read more" never
  // appears on the long notes that are the only reason it exists. The text
  // inside grows freely, and that is what is watched.
  useEffect(() => {
    const element = contentRef.current;
    const box = bodyRef.current;

    if (
      !isDefined(element) ||
      !isDefined(box) ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    const measure = () => {
      const lineHeight =
        parseFloat(getComputedStyle(box).lineHeight) ||
        LINE_HEIGHT * parseFloat(getComputedStyle(box).fontSize);

      setIsLong(element.scrollHeight > lineHeight * COLLAPSED_LINES + 2);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <StyledWrapper>
      <StyledBody
        expanded={expanded}
        clickable={isLong && !expanded}
        ref={bodyRef}
        // The note opens where it is, by clicking it or by the words under it.
        // A link in the note is still a link, and text somebody is half way
        // through selecting is not a click, so neither opens it.
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
        <div ref={contentRef}>
          <LazyMarkdownRenderer text={markdown} />
        </div>
        {!expanded && isLong && <StyledFade />}
      </StyledBody>
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
    </StyledWrapper>
  );
};
