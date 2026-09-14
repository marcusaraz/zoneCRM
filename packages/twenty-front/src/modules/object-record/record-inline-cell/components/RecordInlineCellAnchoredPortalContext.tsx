import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useGetButtonIcon } from '@/object-record/record-field/ui/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import {
  RecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useContext, type ReactNode } from 'react';
import { useIcons } from 'twenty-ui/icon';

type RecordInlineCellAnchoredPortalContextProps = {
  children: ReactNode;
};

export const RecordInlineCellAnchoredPortalContext = ({
  children,
}: RecordInlineCellAnchoredPortalContextProps) => {
  const {
    isRecordFieldReadOnly,
    fieldDefinition,
    isDisplayModeFixHeight,
    onOpenEditMode,
    onCloseEditMode,
    isCentered,
  } = useContext(FieldContext);
  const buttonIcon = useGetButtonIcon();
  const { getIcon } = useIcons();
  const isFieldInputOnly = useIsFieldInputOnly();

  // The hovered copy of a cell is drawn over the cell, in this portal, and
  // has to be laid out exactly as the cell under it: label at the left edge,
  // value at the right edge on the record page, label beside value in the
  // side panel. Without this the copy fell back to the side panel's layout
  // and every value jumped to the left the moment the mouse reached it.
  // Marcus, 14 September 2026. Same rule as FieldsWidgetFieldList.
  const isStacked = useWorkspaceSurface().type !== 'side-panel';

  const RecordInlineCellContextValue: RecordInlineCellContextProps = {
    readonly: isRecordFieldReadOnly,
    buttonIcon: buttonIcon,
    IconLabel: fieldDefinition.iconName
      ? getIcon(fieldDefinition.iconName)
      : undefined,
    label: fieldDefinition.label,
    labelWidth: fieldDefinition.labelWidth,
    showLabel: fieldDefinition.showLabel,
    isCentered,
    isStacked,
    editModeContent: <FieldInput />,
    displayModeContent: <FieldDisplay />,
    isDisplayModeFixHeight: isDisplayModeFixHeight,
    editModeContentOnly: isFieldInputOnly,
    loading: false,
    onOpenEditMode,
    onCloseEditMode,
  };

  return (
    <RecordInlineCellContext.Provider value={RecordInlineCellContextValue}>
      {children}
    </RecordInlineCellContext.Provider>
  );
};
