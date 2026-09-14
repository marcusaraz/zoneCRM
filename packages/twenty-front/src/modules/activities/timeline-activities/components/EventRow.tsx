import { styled } from '@linaria/react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';

import { TIMELINE_ROW_LINE_HEIGHT } from '@/activities/timeline-activities/constants/TimelineRowLineHeight';
import { EventRowDynamicComponent } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { getStandardTimelineActivityRenderer } from '@/activities/timeline-activities/rows/components/StandardTimelineActivityRenderer';
import { type TimelineActivityRenderer } from '@/activities/timeline-activities/rows/components/TimelineActivityRenderer';
import { EventIconDynamicComponent } from '@/activities/timeline-activities/rows/components/EventIconDynamicComponent';
import { getEventTint } from '@/activities/timeline-activities/rows/utils/getEventTint';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { getTimelineActivityAction } from '@/activities/timeline-activities/utils/getTimelineActivityAction';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import { getTimelineActivityLinkedObjectMetadataItem } from '@/activities/timeline-activities/utils/getTimelineActivityLinkedObjectMetadataItem';
import {
  getTimelineActivityAuthorFullName,
  SYSTEM_AUTHOR_NAME,
} from '@/activities/timeline-activities/utils/getTimelineActivityAuthorFullName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { isDefined } from 'twenty-shared/utils';

// Zone CRM: an entry is a disc, a date and what happened, in that order, with a
// hairline between one and the next. The vertical line that used to run down
// the left is gone; the disc stayed, because the eye finds a call in a page of
// entries by its colour long before it reads a word. MASTER.md "Tints".
const StyledTimelineItemContainer = styled.div`
  align-items: flex-start;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-start;
  overflow: hidden;
  padding: 14px 0;
  white-space: nowrap;

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
  }
`;

// The disc is 28px and the line of text beside it is 20, so one cannot simply
// be told to match the other. The slot is the line: the disc is centred in it
// and hangs 4px past it top and bottom, which is symmetrical, so its centre and
// the centre of the first line are the same to a quarter of a pixel. Measured,
// not guessed.
const StyledDiscSlot = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 28px;
  height: ${TIMELINE_ROW_LINE_HEIGHT}px;
  justify-content: center;
`;

// 28px, the smaller end of what MASTER.md allows, because a timeline row is a
// line of text and the disc marks it rather than competing with it. The glyph
// takes the disc's own ink; nothing else on the row is tinted.
const StyledDisc = styled.div<{ tint: string; glyph: string }>`
  align-items: center;
  background: ${({ tint }) => tint};
  border-radius: 50%;
  color: ${({ glyph }) => glyph};
  display: flex;
  flex: 0 0 28px;
  height: 28px;
  justify-content: center;
  user-select: none;
  width: 28px;
`;

const StyledItemContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

type EventRowProps = {
  mainObjectMetadataItem: EnrichedObjectMetadataItem | null;
  // Kept because the list still passes it. Nothing reads it since the rail it
  // used to end went: the hairline sits between rows, not under the last one.
  isLastEvent?: boolean;
  event: TimelineActivity;
};

const getTimelineActivityRenderer = ({
  standardRenderer,
  frontComponentId,
}: {
  standardRenderer: ReturnType<typeof getStandardTimelineActivityRenderer>;
  frontComponentId: string | null;
}): TimelineActivityRenderer | null => {
  if (isDefined(standardRenderer)) {
    return { type: 'standard', Component: standardRenderer };
  }

  if (isDefined(frontComponentId)) {
    return { type: 'frontComponent', frontComponentId };
  }

  return null;
};

export const EventRow = ({ event, mainObjectMetadataItem }: EventRowProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const { recordId } = useContext(TimelineActivityContext);

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const { timelineActivityTypeMaps } = useTimelineActivityTypes();
  const frontComponents = useAtomStateValue(frontComponentsSelector);

  const { objectMetadataItems } = useObjectMetadataItems();

  const timelineActivityType = getTimelineActivityType(
    event,
    timelineActivityTypeMaps,
  );

  const rendererUniversalIdentifier =
    timelineActivityType?.frontComponentUniversalIdentifier;
  const standardRenderer = getStandardTimelineActivityRenderer(
    rendererUniversalIdentifier,
  );
  const frontComponentId = isDefined(rendererUniversalIdentifier)
    ? (frontComponents.find(
        (frontComponent) =>
          frontComponent.universalIdentifier === rendererUniversalIdentifier,
      )?.id ?? null)
    : null;
  const renderer = getTimelineActivityRenderer({
    standardRenderer,
    frontComponentId,
  });

  const timelineActivityAction = getTimelineActivityAction(
    event,
    timelineActivityTypeMaps,
  );

  const linkedObjectMetadataItem =
    getTimelineActivityLinkedObjectMetadataItem({
      timelineActivity: event,
      timelineActivityTypeMaps,
      objectMetadataItems,
    }) ?? null;

  const tint = getEventTint(linkedObjectMetadataItem?.nameSingular);

  if (isUndefinedOrNull(currentWorkspaceMember)) {
    return null;
  }

  if (isUndefinedOrNull(recordStore)) {
    return null;
  }
  if (isUndefinedOrNull(mainObjectMetadataItem)) {
    return null;
  }

  const labelIdentifier = getObjectRecordIdentifier({
    objectMetadataItem: mainObjectMetadataItem,
    record: recordStore,
    allowRequestsToTwentyIcons,
  });

  // Zone CRM: an event on the record itself that no member caused is signed
  // by where the record came from (HubSpot, Zone Chat), when that is known.
  const systemAuthorFullName = getTimelineActivityAuthorFullName(
    event,
    currentWorkspaceMember,
  );
  const createdBy = recordStore.createdBy as
    | { source?: string; name?: string }
    | null
    | undefined;
  const importedFrom =
    createdBy?.source === 'IMPORT' && isDefined(createdBy.name)
      ? createdBy.name
      : null;
  const authorFullName =
    systemAuthorFullName === SYSTEM_AUTHOR_NAME &&
    timelineActivityAction === 'created' &&
    !isDefined(event.linkedRecordId) &&
    isDefined(importedFrom)
      ? importedFrom
      : systemAuthorFullName;

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledDiscSlot>
          <StyledDisc tint={tint.disc} glyph={tint.glyph}>
            <EventIconDynamicComponent
              eventIcon={timelineActivityType?.icon ?? null}
              linkedObjectMetadataItem={linkedObjectMetadataItem}
            />
          </StyledDisc>
        </StyledDiscSlot>
        <StyledItemContainer>
          <EventRowDynamicComponent
            authorFullName={authorFullName}
            labelIdentifierValue={labelIdentifier.name}
            event={event}
            eventAction={timelineActivityAction}
            eventTypeLabel={timelineActivityType?.label}
            renderer={renderer}
            mainObjectMetadataItem={mainObjectMetadataItem}
            linkedObjectMetadataItem={linkedObjectMetadataItem}
            happensAt={event.happensAt}
          />
        </StyledItemContainer>
      </StyledTimelineItemContainer>
    </>
  );
};
