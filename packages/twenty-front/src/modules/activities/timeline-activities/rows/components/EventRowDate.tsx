import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { shortDate } from '@/activities/timeline-activities/rows/utils/shortDate';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

// Zone CRM: the date is a column on the left, not a note on the right.
// A timeline is read down the dates, so they line up and the text starts at one
// place. `order: -1` puts it first without every row component having to move
// it, of which there are five.
const StyledEventRowDate = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
  color: ${themeCssVariables.font.color.tertiary};
  flex: 0 0 88px;
  order: -1;
  padding: 0;
  white-space: nowrap;
  width: 88px;
`;

type EventRowDateProps = {
  happensAt?: string;
};

export const EventRowDate = ({ happensAt }: EventRowDateProps) => {
  const { dateFormat, timeFormat, timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const instanceId = useId();
  const dateElementId = `event-row-date-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  if (!isNonEmptyString(happensAt)) {
    return null;
  }

  // "about 5 hours ago" does not fit in 88px and does not need to: the hour is
  // in the tooltip and the day is what a timeline is read by.
  const relativeHappensAt = shortDate(happensAt, localeCatalog);
  const exactHappensAt = formatDateTimeString({
    value: happensAt,
    timeZone,
    dateFormat,
    timeFormat,
    localeCatalog,
  });

  return (
    <>
      <StyledEventRowDate id={dateElementId} tabIndex={0}>
        {relativeHappensAt}
      </StyledEventRowDate>
      <AppTooltip
        anchorSelect={`#${dateElementId}`}
        title={exactHappensAt}
        delay={TooltipDelay.mediumDelay}
        noArrow
        place="left"
      />
    </>
  );
};
