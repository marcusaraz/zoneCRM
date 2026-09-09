import { t } from '@lingui/core/macro';
import { type KeyboardEvent, useState } from 'react';

import { EventCard } from '@/activities/timeline-activities/rows/components/EventCard';
import { EventCardToggleButton } from '@/activities/timeline-activities/rows/components/EventCardToggleButton';
import { EventRowActivityCard } from '@/activities/timeline-activities/rows/generic/components/EventRowActivityCard';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { EventRowDate } from '@/activities/timeline-activities/rows/components/EventRowDate';
import { type EventRowNativeComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowItem } from '@/activities/timeline-activities/rows/components/EventRowItem';
import { getAuthorizedLinkedRecordName } from '@/activities/timeline-activities/rows/generic/utils/getAuthorizedLinkedRecordName';
import {
  StyledEventRow,
  StyledEventRowContainer,
  StyledEventRowContent,
  StyledEventRowLinkedRecord,
} from '@/activities/timeline-activities/rows/components/EventRowStyles';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { SidePanelSearchRecordPreviewCard } from '@/side-panel/pages/search/components/SidePanelSearchRecordPreviewCard';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type EventRowGenericLinkedProps = EventRowNativeComponentProps;

export const EventRowGenericLinked = ({
  event,
  eventTypeLabel,
  authorFullName,
  linkedObjectMetadataItem,
  happensAt,
  hasRenderer,
}: EventRowGenericLinkedProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  // Zone CRM: a note or task attached to the record is shown as itself, open by
  // default, rather than as a "linked a related note" line with a hidden card.
  const activityObjectName = linkedObjectMetadataItem?.nameSingular;
  const isActivity =
    (activityObjectName === 'note' || activityObjectName === 'task') &&
    eventTypeLabel?.startsWith('linked') === true;
  // Records created through the API carry the workspace name as author. An
  // imported note or task knows who wrote it in HubSpot (createdBy, source
  // IMPORT), so that name stands in for the workspace.
  const isImportedActivity = isActivity && authorFullName === 'Twenty';
  const { record: activityRecord } = useFindOneRecord<
    ObjectRecord & { createdBy?: FieldActorValue | null }
  >({
    objectNameSingular: activityObjectName ?? 'note',
    objectRecordId: event.linkedRecordId ?? '',
    recordGqlFields: { id: true, createdBy: true },
    skip: !isImportedActivity,
  });
  const importedAuthor =
    activityRecord?.createdBy?.source === 'IMPORT'
      ? activityRecord.createdBy.name
      : null;
  const displayedAuthor = isImportedActivity ? importedAuthor : authorFullName;
  const showAuthor = isDefined(displayedAuthor) && displayedAuthor !== '';

  const [isOpen, setIsOpen] = useState(isActivity);

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const linkedRecordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    {
      recordId: event.linkedRecordId ?? '',
      allowRequestsToTwentyIcons,
    },
  );

  const objectLabel =
    linkedObjectMetadataItem?.labelSingular?.toLowerCase() ?? t`record`;

  const linkedRecordName = getAuthorizedLinkedRecordName(
    linkedRecordIdentifier?.name,
  );

  const linkedRecord =
    isDefined(event.linkedRecordId) &&
    isDefined(linkedObjectMetadataItem?.nameSingular)
      ? {
          id: event.linkedRecordId,
          objectNameSingular: linkedObjectMetadataItem.nameSingular,
        }
      : undefined;

  const canOpen =
    hasRenderer !== true &&
    isDefined(linkedRecord) &&
    isDefined(linkedRecordName);

  const handleOpen = () => {
    if (!isDefined(linkedRecord)) {
      return;
    }

    openRecordInSidePanel({
      recordId: linkedRecord.id,
      objectNameSingular: linkedRecord.objectNameSingular,
    });
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLSpanElement>) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      handleOpen();
    }
  };

  return (
    <StyledEventRow>
      <StyledEventRowContainer>
        <StyledEventRowContent>
          {showAuthor && <EventRowItem>{displayedAuthor}</EventRowItem>}
          <EventRowItem variant="action">
            {isActivity
              ? activityObjectName === 'note'
                ? t`added a note`
                : t`added a task`
              : (eventTypeLabel ?? t`linked a ${objectLabel}`)}
          </EventRowItem>
          {canOpen && !isActivity && (
            <StyledEventRowLinkedRecord
              role="button"
              tabIndex={0}
              onClick={handleOpen}
              onKeyDown={handleKeyDown}
            >
              <OverflowingTextWithTooltip text={linkedRecordName} />
            </StyledEventRowLinkedRecord>
          )}
          {canOpen && (
            <EventCardToggleButton isOpen={isOpen} setIsOpen={setIsOpen} />
          )}
        </StyledEventRowContent>
        <EventRowDate happensAt={happensAt} />
      </StyledEventRowContainer>
      {canOpen && (
        <EventCard isOpen={isOpen} isFullWidth={isActivity}>
          {isActivity ? (
            <EventRowActivityCard
              objectNameSingular={activityObjectName}
              recordId={linkedRecord.id}
            />
          ) : (
            <SidePanelSearchRecordPreviewCard
              objectNameSingular={linkedRecord.objectNameSingular}
              recordId={linkedRecord.id}
              label={linkedRecordName}
            />
          )}
        </EventCard>
      )}
    </StyledEventRow>
  );
};
