import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { getSidePanelSearchResultAnchorId } from '@/side-panel/pages/search/utils/getSidePanelSearchResultAnchorId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { css } from '@linaria/core';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

// The card brings its own surface, so the tooltip only contributes the shadow.
// Tooltips render at 0.9 opacity, which would make the card translucent.
// Zone CRM: results read as a striped list, without the grey band that
// followed the keyboard selection and the pointer over the names, and
// without the preview card that used to float beside them.
const resultItemClass = css`
  & > div > [data-focused],
  & > div > [data-key-selected],
  & > div > :hover {
    background: transparent;
  }
`;

const resultItemStripedClass = css`
  background: ${themeCssVariables.background.secondary};
`;

export const SidePanelSearchRecordsPage = () => {
  const { t } = useLingui();
  const { searchResultItems, loading, noResults } = useSidePanelSearchRecords();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { closeCommandMenu } = useCloseCommandMenu();
  const navigate = useNavigate();

  const selectableItemIds = useMemo(
    () => searchResultItems.map((item) => item.id),
    [searchResultItems],
  );

  return (
    <>
      <SidePanelList
        selectableItemIds={selectableItemIds}
        loading={loading}
        noResults={noResults}
      >
        {searchResultItems.length > 0 && (
          <SidePanelGroup heading={t`Results`}>
            {searchResultItems.map((item, index) => {
              const isTaskOrNote = [
                CoreObjectNameSingular.Task,
                CoreObjectNameSingular.Note,
              ].includes(item.objectNameSingular as CoreObjectNameSingular);

              const handleClick = () => {
                if (isTaskOrNote) {
                  openRecordInSidePanel({
                    recordId: item.recordId,
                    objectNameSingular:
                      item.objectNameSingular as CoreObjectNameSingular,
                  });
                } else {
                  closeCommandMenu();
                  navigate(
                    getAppPath(AppPath.RecordShowPage, {
                      objectNameSingular: item.objectNameSingular,
                      objectRecordId: item.recordId,
                    }),
                  );
                }
              };

              return (
                <SelectableListItem
                  key={item.id}
                  itemId={item.id}
                  onEnter={handleClick}
                  className={
                    index % 2 === 1
                      ? `${resultItemClass} ${resultItemStripedClass}`
                      : resultItemClass
                  }
                >
                  <div id={getSidePanelSearchResultAnchorId(item.id)}>
                    <CommandMenuItem
                      id={item.id}
                      label={item.label}
                      description={item.objectLabel}
                      onClick={handleClick}
                      LeftComponent={
                        <Avatar
                          type={item.avatarType}
                          avatarUrl={getAbsoluteImageUrl(item.imageUrl)}
                          placeholderColorSeed={item.recordId}
                          placeholder={item.label}
                        />
                      }
                    />
                  </div>
                </SelectableListItem>
              );
            })}
          </SidePanelGroup>
        )}
      </SidePanelList>
    </>
  );
};
