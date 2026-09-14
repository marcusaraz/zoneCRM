import { createContext, type ReactElement, useContext } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

export type RecordInlineCellContextProps = {
  readonly?: boolean;
  IconLabel?: IconComponent;
  label?: string;
  labelWidth?: number;
  showLabel?: boolean;
  // Label above value rather than beside it: the record page's left card,
  // per design-system/capital-works/MASTER.md. Everywhere else keeps the row.
  isStacked?: boolean;
  buttonIcon?: IconComponent;
  editModeContent?: ReactElement;
  editModeContentOnly?: boolean;
  displayModeContent?: ReactElement;
  isDisplayModeFixHeight?: boolean;
  disableHoverEffect?: boolean;
  loading?: boolean;
  isCentered?: boolean;
  onOpenEditMode?: () => void;
  onCloseEditMode?: () => void;
};

const defaultRecordInlineCellContextProp: RecordInlineCellContextProps = {
  readonly: false,
  IconLabel: undefined,
  label: '',
  labelWidth: 0,
  showLabel: false,
  isStacked: false,
  buttonIcon: undefined,
  editModeContent: undefined,
  editModeContentOnly: false,
  displayModeContent: undefined,
  isDisplayModeFixHeight: false,
  disableHoverEffect: false,
  loading: false,
  isCentered: false,
  onOpenEditMode: undefined,
  onCloseEditMode: undefined,
};

export const RecordInlineCellContext =
  createContext<RecordInlineCellContextProps>(
    defaultRecordInlineCellContextProp,
  );

export const useRecordInlineCellContext = (): RecordInlineCellContextProps => {
  const context = useContext(RecordInlineCellContext);
  return context;
};
