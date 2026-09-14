import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

// Zone CRM: the record says its own name, at the top of its own column.
//
// It used to say it in the bar across the top of the page, which the search now
// has to itself. A record with no name anywhere is worse than either, so this
// card is not a person's card: every object gets it, and a deal is as entitled
// to be called something as a customer is.
//
// The name is still the editable title cell, so renaming is where it always
// was: click the name.

const StyledCard = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-radius: 12px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[3]};
  margin: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledName = styled.div`
  font-size: 1.62rem; // Title, MASTER.md: 21px on a 13px root
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.01em;
  min-width: 0;
`;

export const RecordHeaderCard = ({
  objectNameSingular,
  objectRecordId,
}: {
  objectNameSingular: string;
  objectRecordId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    { recordId: objectRecordId, allowRequestsToTwentyIcons },
  );

  const labelIdentifierFieldMetadataItem =
    objectMetadataItem.labelIdentifierFieldMetadataId !== null
      ? objectMetadataItem.fields.find(
          (field) =>
            field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
        )
      : undefined;

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
  });

  const isLabelIdentifierReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItem.id,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
  });

  if (!isDefined(recordIdentifier)) {
    return null;
  }

  return (
    <StyledCard>
      <Avatar
        avatarUrl={getAbsoluteImageUrl(recordIdentifier.avatarUrl)}
        placeholder={recordIdentifier.name}
        placeholderColorSeed={objectRecordId}
        size="xl"
        type={recordIdentifier.avatarType}
      />
      <StyledName>
        <FieldContext.Provider
          value={{
            recordId: objectRecordId,
            isLabelIdentifier: false,
            fieldDefinition: {
              type:
                labelIdentifierFieldMetadataItem?.type ??
                FieldMetadataType.TEXT,
              iconName: '',
              fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
              label: labelIdentifierFieldMetadataItem?.label ?? '',
              metadata: {
                fieldName: labelIdentifierFieldMetadataItem?.name ?? '',
                objectMetadataNameSingular: objectNameSingular,
              },
              defaultValue: labelIdentifierFieldMetadataItem?.defaultValue,
            },
            useUpdateRecord: useUpdateOneObjectRecordMutation,
            isCentered: false,
            isDisplayModeFixHeight: false,
            isRecordFieldReadOnly: isLabelIdentifierReadOnly,
          }}
        >
          <RecordTitleCell
            sizeVariant="md"
            containerType={RecordTitleCellContainerType.ShowPage}
          />
        </FieldContext.Provider>
      </StyledName>
    </StyledCard>
  );
};
