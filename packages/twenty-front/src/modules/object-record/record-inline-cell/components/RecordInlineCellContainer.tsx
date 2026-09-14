import { styled } from '@linaria/react';
import { useContext } from 'react';
import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';

import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import {
  AppTooltip,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/surfaces';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from './RecordInlineCellContext';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  width: 16px;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

// Decision 11, Marcus on 14 September 2026, having seen the two side by side:
// the label sits above its value and is set in the same size as the value.
// Not the drawing's Label type, not the row I built before it: a line of
// supporting text, then the thing itself.
//
//     Email
//     elena.rostova@apexmobility.io
//
const StyledLabelAndIconContainer = styled.div<{ stacked?: boolean }>`
  align-items: center;
  align-self: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  height: ${({ stacked }) => (stacked ? 'auto' : '24px')};
`;

const StyledValueContainer = styled.div<{
  readonly: boolean;
  stacked?: boolean;
}>`
  display: flex;
  min-width: 0;
  position: relative;
  user-select: text;
  width: 100%;

  // Body type, MASTER.md: 15px on a 13px root, and decision 11 sets the label
  // to the same, so what tells them apart is the colour and the order.
  font-size: ${({ stacked }) => (stacked ? '1.15rem' : 'inherit')};
`;

const StyledLabelContainer = styled.div<{ width?: number; stacked?: boolean }>`
  color: ${({ stacked }) =>
    stacked
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.tertiary};
  font-size: ${({ stacked }) =>
    stacked ? '1.15rem' : themeCssVariables.font.size.sm};
  width: ${({ width, stacked }) =>
    stacked ? 'auto' : width !== undefined ? `${width}px` : 'auto'};

  // Decision 11: the same size as the value, normal weight, written the way
  // the field is written. No uppercase and no tracking: the field is called
  // Lead status, so that is what the card says.
  font-weight: ${({ stacked }) => (stacked ? '400' : 'inherit')};
  letter-spacing: normal;
  text-transform: none;
`;

const StyledInlineCellBaseContainer = styled.div<{
  readonly: boolean;
  stacked?: boolean;
}>`
  align-items: ${({ stacked }) => (stacked ? 'stretch' : 'center')};
  box-sizing: border-box;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  flex-direction: ${({ stacked }) => (stacked ? 'column' : 'row')};
  gap: ${({ stacked }) => (stacked ? '2px' : themeCssVariables.spacing[1])};
  height: fit-content;
  user-select: none;
  width: 100%;

  // Twelve above and twelve below, which is the drawing's py-3, with the
  // hairline the card draws between rows falling exactly halfway between one
  // field and the next.
  padding: ${({ stacked }) => (stacked ? '12px 0' : '0')};
`;

export const StyledSkeletonDiv = styled.div`
  height: 24px;
`;

export const RecordInlineCellContainer = () => {
  const { readonly, IconLabel, label, labelWidth, showLabel, isStacked } =
    useRecordInlineCellContext();
  const { theme } = useContext(ThemeContext);

  const { recordId, fieldDefinition, onMouseEnter, onMouseLeave, anchorId } =
    useContext(FieldContext);

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);
  }

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
    onMouseEnter?.();
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
    onMouseLeave?.();
  };

  const labelId = `label-${getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldDefinition?.metadata?.fieldName,
  })}`;

  return (
    <StyledInlineCellBaseContainer
      readonly={readonly ?? false}
      stacked={isStacked}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {(IconLabel || label) && (
        <StyledLabelAndIconContainer
          stacked={isStacked}
          id={!showLabel ? labelId : undefined}
        >
          {/* The record page's label already holds its own column, so the icon
              that told a label from its value in a narrow panel has nothing
              left to do. */}
          {IconLabel && isStacked !== true && (
            <StyledIconContainer>
              <IconLabel stroke={theme.icon.stroke.sm} />
            </StyledIconContainer>
          )}
          {showLabel && (
            <StyledLabelContainer width={labelWidth} stacked={isStacked}>
              <FieldDescriptionTooltip
                label={label}
                description={fieldDefinition?.metadata?.description}
                fallback={
                  <OverflowingTextWithTooltip
                    text={label}
                    displayedMaxRows={1}
                  />
                }
              />
            </StyledLabelContainer>
          )}
          {/* TODO: Displaying Tooltips on the board is causing performance issues https://react-tooltip.com/docs/examples/render */}
          {!showLabel && (
            <AppTooltip
              anchorSelect={`#${labelId}`}
              title={label}
              interactive
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          )}
        </StyledLabelAndIconContainer>
      )}
      <StyledValueContainer
        readonly={readonly ?? false}
        stacked={isStacked}
        id={anchorId}
      >
        <RecordInlineCellValue />
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
