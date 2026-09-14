import { styled } from '@linaria/react';
import { useSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useSelectFieldDisplay';
import { SelectDisplay } from 'twenty-ui/data-display';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Decision 14, Marcus on 14 September 2026: a select value is plain text in
// the reading ink. A status is the exception and keeps a quiet pill, because
// where a record stands is a thing people scan a list for and a pill is what
// the eye finds.
//
// These are the two he named. A field that ought to read as a status and does
// not is added here by its name; nothing else about it changes.
const STATUS_FIELD_NAMES = ['leadStatus', 'stage'];

const StyledPlainValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SelectFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useSelectFieldDisplay();

  const selectedOption = fieldDefinition.metadata.options?.find(
    (option) => option.value === fieldValue,
  );

  if (!isDefined(selectedOption)) {
    return <></>;
  }

  const isStatus = STATUS_FIELD_NAMES.includes(
    fieldDefinition.metadata.fieldName,
  );

  if (!isStatus) {
    return <StyledPlainValue>{selectedOption.label}</StyledPlainValue>;
  }

  // The colour asked for here is ignored by Tag, which draws every pill the
  // same quiet way. It is passed because the type asks for one.
  return (
    <SelectDisplay color={selectedOption.color} label={selectedOption.label} />
  );
};
