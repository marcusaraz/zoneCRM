import { styled } from '@linaria/react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';

import { TIMELINE_ICON_SLOT_SIZE } from '@/activities/timeline-activities/constants/TimelineIconSlotSize';
import { EventRowDynamicComponent } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent';
import { getStandardTimelineActivityRenderer } from '@/activities/timeline-activities/rows/components/StandardTimelineActivityRenderer';
import { type TimelineActivityRenderer } from '@/activities/timeline-activities/rows/components/TimelineActivityRenderer';
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

// Zone CRM: an entry is a date and what happened, side by side, with a hairline
// between one and the next. The icon rail and its vertical line that used to
// run down the left are gone: the words already say whether it was a call, a
// note or a task, and the rail was holding the place where the date belongs.
const StyledTimelineItemContainer = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-start;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]} 0;
  white-space: nowrap;

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledItemContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${TIMELINE_ICON_SLOT_SIZE}px;
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
