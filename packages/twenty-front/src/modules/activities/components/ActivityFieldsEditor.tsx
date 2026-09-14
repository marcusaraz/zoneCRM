import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { FieldDescriptionTooltipProvider } from '@/object-record/record-field/ui/components/FieldDescriptionTooltipProvider';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { FieldsWidgetCellEditModePortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellEditModePortal';
import { FieldsWidgetCellHoveredPortal } from '@/page-layout/widgets/fields/components/FieldsWidgetCellHoveredPortal';
import { FieldsWidgetFieldItem } from '@/page-layout/widgets/fields/components/FieldsWidgetFieldItem';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

// The fields of a task, editable where the task is shown.
//
// This is the record page's own field list pointed at a different record: the
// same cells, the same pickers, the same save. It is not a copy of that list
// because the list is a page layout widget tied to the record the page is
// about, and a task in the timeline is not that record. The cells and their
// two portals (the hover ring and the open editor) are what make a field
// editable, so they come along; the group headers and the hidden-fields fold
// do not, because a task has six fields and they all show.

const StyledList = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  margin-top: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

type ActivityFieldsEditorProps = {
  objectNameSingular: 'note' | 'task';
  recordId: string;
  fieldNames: string[];
};

export const ActivityFieldsEditor = ({
  objectNameSingular,
  recordId,
  fieldNames,
}: ActivityFieldsEditorProps) => {
  const instanceId = `activity-card-fields-${recordId}`;

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const setRecordFieldListHoverPosition = useSetAtomComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  // In the order asked for, and only the ones the object actually has: a
  // field the app has not installed yet is skipped, not drawn empty.
  const fieldMetadataItems = fieldNames
    .map((name) =>
      objectMetadataItem.fields.find(
        (field) => field.name === name && field.isActive,
      ),
    )
    .filter(isDefined);

  return (
    <FieldDescriptionTooltipProvider>
      <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
        <RecordFieldListComponentInstanceContext.Provider
          value={{ instanceId }}
        >
          <StyledList>
            {fieldMetadataItems.map((fieldMetadataItem, index) => (
              <FieldsWidgetFieldItem
                key={recordId + fieldMetadataItem.id}
                fieldMetadataItem={fieldMetadataItem}
                globalIndex={index}
                recordId={recordId}
                objectMetadataItem={objectMetadataItem}
                objectMetadataItems={objectMetadataItems}
                objectPermissionsByObjectMetadataId={
                  objectPermissionsByObjectMetadataId
                }
                isRecordReadOnly={isRecordReadOnly}
                useUpdateRecord={useUpdateOneObjectRecordMutation}
                recordLoading={false}
                instanceId={instanceId}
                onMouseEnter={() => setRecordFieldListHoverPosition(index)}
                isStacked={false}
              />
            ))}
          </StyledList>
          <FieldsWidgetCellHoveredPortal
            objectMetadataItem={objectMetadataItem}
            recordId={recordId}
            flattenedFieldMetadataItems={fieldMetadataItems}
          />
          <FieldsWidgetCellEditModePortal
            objectMetadataItem={objectMetadataItem}
            recordId={recordId}
            flattenedFieldMetadataItems={fieldMetadataItems}
          />
        </RecordFieldListComponentInstanceContext.Provider>
      </RecordFieldsScopeContextProvider>
    </FieldDescriptionTooltipProvider>
  );
};
