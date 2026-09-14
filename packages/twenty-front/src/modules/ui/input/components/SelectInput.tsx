import { AddSelectOptionMenuItem } from '@/settings/data-model/fields/forms/select/components/AddSelectOptionMenuItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type TagColor } from 'twenty-ui/data-display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemSelectTag } from 'twenty-ui/navigation';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

// Eight rows is about as much as the eye takes in at once. At or under that a
// list is read, not searched.
const SEARCHABLE_OPTION_COUNT = 8;

interface SelectInputProps {
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: SelectOption[];
  onCancel?: () => void;
  defaultOption?: SelectOption;
  onFilterChange?: (filteredOptions: SelectOption[]) => void;
  onClear?: () => void;
  clearLabel?: string;
  focusId: string;
  onAddSelectOption?: (optionName: string) => void;
}

export const SelectInput = ({
  onOptionSelected,
  onClear,
  clearLabel,
  options,
  onCancel,
  defaultOption,
  onFilterChange,
  onAddSelectOption,
}: SelectInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    selectableListInstanceId,
  );

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | undefined
  >(defaultOption);

  // Marcus, 14 September 2026, on the task Reminder list: the options are to
  // read in the order they were written, shortest wait to longest. They did
  // not, because whatever was already chosen was lifted to the top, so opening
  // the list with "1 day before" set put the longest wait first and the rest
  // out of order behind it. The option stays where it belongs and the tick
  // says which one it is.
  const optionsInDropDown = useMemo(() => {
    const searchTerm = normalizeSearchText(searchFilter);

    return options.filter((option) =>
      normalizeSearchText(option.label).includes(searchTerm),
    );
  }, [options, searchFilter]);

  const optionsToSelect = useMemo(
    () =>
      optionsInDropDown.filter(
        (option) => option.value !== selectedOption?.value,
      ),
    [optionsInDropDown, selectedOption?.value],
  );

  const handleOptionChange = (option: SelectOption) => {
    setSelectedOption(option);
    onOptionSelected(option);
  };

  const handleClearOption = () => {
    setSelectedOption(undefined);
    onClear?.();
  };

  useEffect(() => {
    onFilterChange?.(optionsInDropDown);
  }, [onFilterChange, optionsInDropDown]);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.preventDefault();
      const weAreNotInAnHTMLInput = !(
        event.target instanceof HTMLInputElement &&
        event.target.tagName === 'INPUT'
      );
      if (weAreNotInAnHTMLInput && isDefined(onCancel)) {
        onCancel();
      }
    },
    listenerId: 'select-input',
  });

  // A search box over five rows is furniture. Marcus asked for it off the task
  // Reminder list on 14 September 2026, and the same is true of every short
  // list: Status, Priority, Type. Past the threshold a list stops being
  // scannable and the box earns its place, so it comes back.
  //
  // Typing a name that matches nothing is also how an administrator adds an
  // option without leaving the record, so on a short list that way in goes
  // with the box. Settings is where a field's options are kept, and a short
  // list is one that is read at a glance, which is what was asked for.
  const shouldShowSearchInput = options.length > SEARCHABLE_OPTION_COUNT;

  return (
    <DropdownContent ref={containerRef} selectDisabled>
      {shouldShowSearchInput && (
        <>
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            autoFocus
          />
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer hasMaxHeight>
        {onClear && clearLabel && (
          <SelectableListItem
            itemId={t`No ${clearLabel}`}
            onEnter={handleClearOption}
          >
            <MenuItemSelectTag
              key={t`No ${clearLabel}`}
              text={t`No ${clearLabel}`}
              color="transparent"
              variant="outline"
              onClick={handleClearOption}
              isKeySelected={selectedItemId === t`No ${clearLabel}`}
            />
          </SelectableListItem>
        )}
        {optionsInDropDown.map((option) => {
          return (
            <SelectableListItem
              key={option.value}
              itemId={option.value}
              onEnter={() => handleOptionChange(option)}
            >
              <MenuItemSelectTag
                key={option.value}
                selected={selectedOption?.value === option.value}
                text={option.label}
                color={(option.color as TagColor) ?? 'transparent'}
                onClick={() => handleOptionChange(option)}
                LeftIcon={option.Icon}
                isKeySelected={selectedItemId === option.value}
              />
            </SelectableListItem>
          );
        })}
      </DropdownMenuItemsContainer>
      {onAddSelectOption && searchFilter && optionsToSelect.length === 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer scrollable={false}>
            <AddSelectOptionMenuItem
              name={searchFilter}
              onAddSelectOption={onAddSelectOption}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};
