import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { NavigationDrawerSearchInput } from '@/search-page/components/NavigationDrawerSearchInput';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledEditableTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  width: 100%;
`;

// C36: one search, and this is it. It is exactly as wide as the column of cards
// under it, so the two left edges and the two right edges line up and the bar
// reads as the top of that column rather than as a strip of its own.
// As wide as the column of cards under it, and no wider. It may shrink: at
// 1280 with the sidebar open there is not room for a 380 pill, the record's
// name and the action cluster on one line, and when the pill refused to give
// way the cluster was painted over "Send Email". Seen on 14 September 2026 in
// the 1280 pass. The pill yields first, down to a width that still reads as
// a search box; the actions never overlap anything.
const StyledSearchContainer = styled.div`
  flex: 0 1 ${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px;
  min-width: 220px;
`;

const StyledTitle = styled.div<{ isEmphasized: boolean }>`
  font-size: ${({ isEmphasized }) =>
    isEmphasized ? themeCssVariables.font.size.md : 'inherit'};
  font-weight: ${({ isEmphasized }) =>
    isEmphasized ? themeCssVariables.font.weight.semiBold : 'inherit'};
  max-width: 100%;
  overflow: hidden;
  width: fit-content;
`;

const StyledAvatarContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin-right: ${themeCssVariables.spacing[0.5]};
  padding: ${themeCssVariables.spacing[1]};
`;

export const ObjectRecordShowPageBreadcrumb = ({
  objectNameSingular,
  objectRecordId,
  labelIdentifierFieldMetadataItem,
}: {
  objectNameSingular: string;
  objectRecordId: string;
  // Still passed by the page; nothing reads it since the prefix went.
  objectLabel?: string;
  labelIdentifierFieldMetadataItem?: FieldMetadataItem;
}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isMobile = useIsMobile();

  const { loading } = useFindOneRecord({
    objectNameSingular,
    objectRecordId,
    recordGqlFields: {
      [labelIdentifierFieldMetadataItem?.name ?? 'name']: true,
    },
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    {
      recordId: objectRecordId,
      allowRequestsToTwentyIcons,
    },
  );

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
  });

  const isLabelIdentifierReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItem.id,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
  });

  if (!loading && isInitialLoad) {
    setIsInitialLoad(false);
  }

  if (isInitialLoad && loading) {
    return null;
  }

  return (
    <StyledEditableTitleContainer data-testid="top-bar-title">
      {isMobile ? (
        isDefined(recordIdentifier) && (
          <StyledAvatarContainer>
            <Avatar
              avatarUrl={getAbsoluteImageUrl(recordIdentifier.avatarUrl)}
              placeholder={recordIdentifier.name}
              placeholderColorSeed={objectRecordId}
              size="md"
              type={recordIdentifier.avatarType}
            />
          </StyledAvatarContainer>
        )
      ) : (
        // Zone CRM, C35: the search box stands where the breadcrumb did.
        // "People / Oğuzhan Aydın (2 of 4,095)" told a reader three things they
        // already knew and gave them nothing to do; the search is the thing
        // reached for most from a record, and it is now the width of a hand
        // away rather than in the sidebar.
        <StyledSearchContainer>
          <NavigationDrawerSearchInput variant="pill" />
        </StyledSearchContainer>
      )}
      {isMobile && (
        <StyledTitle isEmphasized={isMobile}>
          <FieldContext.Provider
            value={{
              recordId: objectRecordId,
              isLabelIdentifier: false,
              fieldDefinition: {
                type:
                  labelIdentifierFieldMetadataItem?.type ||
                  FieldMetadataType.TEXT,
                iconName: '',
                fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
                label: labelIdentifierFieldMetadataItem?.label || '',
                metadata: {
                  fieldName: labelIdentifierFieldMetadataItem?.name || '',
                  objectMetadataNameSingular: objectNameSingular,
                },
                defaultValue: labelIdentifierFieldMetadataItem?.defaultValue,
              },
              useUpdateRecord: useUpdateOneObjectRecordMutation,
              isCentered: false,
              isDisplayModeFixHeight: true,
              isRecordFieldReadOnly: isLabelIdentifierReadOnly,
            }}
          >
            <RecordTitleCell
              sizeVariant={isMobile ? 'sm' : 'xs'}
              containerType={RecordTitleCellContainerType.PageHeader}
            />
          </FieldContext.Provider>
        </StyledTitle>
      )}
    </StyledEditableTitleContainer>
  );
};
