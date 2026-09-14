import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';

// C29, Marcus 14 September 2026: what somebody wrote, shown as they wrote it.
//
// Six lines of it, not a hundred pixels: six is enough to know whether this is
// the one you are looking for and few enough that the next entry is still on
// the screen, and a line is what a reader counts. Anything longer fades into
// the card over its last line, which is how a reader knows there is more
// without being told, and opens where it is.
//
// One component because the timeline and the Notes tab are the same promise
// twice, and a rule about six lines kept in two places is a rule about five
// lines by Christmas.
const COLLAPSED_LINES = 6;
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

const StyledFade = styled.div<{ ground: string }>`
  background: ${({ ground }) =>
    `linear-gradient(to bottom, ${themeCssVariables.background.transparent.lighter}, ${ground})`};
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
  // What the last line fades into, which is whatever the card is painted with.
  ground?: string;
};

export const ActivityBody = ({
  markdown,
  ground = themeCssVariables.background.secondary,
}: ActivityBodyProps) => {
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
        <LazyMarkdownRenderer text={markdown} />
        {!expanded && isLong && <StyledFade ground={ground} />}
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
