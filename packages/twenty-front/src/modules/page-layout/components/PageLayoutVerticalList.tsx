import { PageLayoutVerticalListWidgetSlot } from '@/page-layout/components/PageLayoutVerticalListWidgetSlot';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useIsSideColumnContext } from '@/page-layout/hooks/useIsSideColumnContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type PageLayoutWidgetListDropData } from '@/page-layout/types/PageLayoutWidgetListDropData';
import { canVerticalListAcceptWidgetDrag } from '@/page-layout/utils/canVerticalListAcceptWidgetDrag';
import { getIsSingleWidgetTab } from '@/page-layout/utils/getIsSingleWidgetTab';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { WorkflowDiagramAllowPageScrollContext } from '@/workflow/workflow-diagram/contexts/WorkflowDiagramAllowPageScrollContext';
import { type Draggable } from '@dnd-kit/abstract';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { styled } from '@linaria/react';
import { Fragment, type ReactNode, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

const StyledVerticalListContainer = styled.div<{
  isInEditMode: boolean;
  isInPinnedTab: boolean;
  isSideColumnContext: boolean;
  shouldUseWhiteBackground: boolean;
  isMobile: boolean;
  isOnRecordGround: boolean;
}>`
  // The pinned tab is the record's left column, and MASTER.md draws that as
  // white cards on a ground rather than one sheet: the column itself paints
  // nothing, so the panel's tertiary ground shows between the cards, and each
  // card is white. Everywhere else keeps Twenty's single surface.
  --record-card-background-color: ${({
    shouldUseWhiteBackground,
    isInPinnedTab,
  }) =>
    shouldUseWhiteBackground || isInPinnedTab
      ? themeCssVariables.background.primary
      : themeCssVariables.background.secondary};
  --viewport-filling-widget-editor-block-inset: ${({
    isInEditMode,
    isSideColumnContext,
  }) =>
    isInEditMode
      ? isSideColumnContext
        ? themeCssVariables.spacing[2]
        : themeCssVariables.spacing[4]
      : '0px'};
  --widget-card-content-overflow: visible;
  --widget-height: auto;
  --widget-scroll-overflow: visible;

  // Marcus, 15 September 2026: the two columns of a record are built the same
  // way. The ground shows through, the cards sit directly on it, and the inset
  // and the gap are the same eight on both sides. It read as white, grey, white
  // before: a sheet holding a band holding a card.
  background: ${({ isOnRecordGround }) =>
    isOnRecordGround ? 'transparent' : 'var(--record-card-background-color)'};
  display: flex;
  flex-direction: column;
  // Eight between one card and the next, which is what makes a corner read as
  // a corner rather than as a join.
  gap: ${({ isOnRecordGround }) =>
    isOnRecordGround ? themeCssVariables.spacing[2] : '0'};
  min-height: ${({ isInEditMode }) => (isInEditMode ? '0' : '100%')};
  // The pinned tab sits next to the main tab area, so while editing it takes
  // that area's vertical padding to line their widgets up, and keeps the
  // tighter side-column one horizontally where the narrow column needs the
  // room.
  padding: ${({
    isInEditMode,
    isInPinnedTab,
    isSideColumnContext,
    isOnRecordGround,
  }) =>
    isInEditMode
      ? isInPinnedTab
        ? `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}`
        : isSideColumnContext
          ? themeCssVariables.spacing[1]
          : themeCssVariables.spacing[2]
      : isOnRecordGround
        ? themeCssVariables.spacing[2]
        : '0'};
`;

const StyledHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledDropTarget = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: ${themeCssVariables.spacing[6]};
  position: relative;

  &:not(:first-child) {
    margin-top: ${themeCssVariables.spacing[4]};
  }
`;

type PageLayoutVerticalListProps = {
  isInEditMode: boolean;
  widgets: PageLayoutWidget[];
  leadingElement?: ReactNode;
  trailingElement?: ReactNode;
  renderWidgetSeparator?: (widget: PageLayoutWidget) => ReactNode;
};

export const PageLayoutVerticalList = ({
  isInEditMode,
  widgets,
  leadingElement,
  trailingElement,
  renderWidgetSeparator,
}: PageLayoutVerticalListProps) => {
  const { layoutMode, tabId } = usePageLayoutContentContext();

  const { isInPinnedTab, isMobile, isSideColumnContext } =
    useIsSideColumnContext();
  const { currentPageLayout } = useCurrentPageLayout();

  // Both columns of a record page stand on the ground. The pinned one always
  // did; the tab column was a white sheet of its own, which is what made the
  // page read as a box inside a box. A dashboard is still one surface, and a
  // phone still is, because there are no two columns to line up there.
  const isOnRecordGround =
    currentPageLayout?.type === PageLayoutType.RECORD_PAGE && !isMobile;

  const shouldUseSoloCanvasPresentation =
    layoutMode === PageLayoutTabLayoutMode.CANVAS &&
    getIsSingleWidgetTab({
      tab: {
        layoutMode,
        widgets,
      },
    }) &&
    !isInEditMode &&
    !isInPinnedTab;

  // A viewport-filling slot is exactly one viewport tall, so the list only
  // overflows when something else shares it. Widgets that capture the wheel
  // (workflow canvases) must keep it when there is no page scroll to reach.
  const hasPageScroll = isInEditMode || widgets.length > 1;

  const firstViewportFillingWidgetIndex = widgets.findIndex((widget) =>
    isViewportFillingWidgetType(widget.type),
  );
  const hasViewportFillingWidget = firstViewportFillingWidgetIndex !== -1;

  const endDropData: PageLayoutWidgetListDropData = {
    type: 'widget-list',
    tabId,
    itemCount: widgets.length,
  };

  const canAcceptWidgetDrag = useCallback(
    (source: Draggable) =>
      canVerticalListAcceptWidgetDrag({
        destinationWidgets: widgets,
        source,
      }),
    [widgets],
  );

  const { ref: endDropZoneRef } = useDroppable({
    id: `page-layout-widget-list-${tabId}`,
    accept: canAcceptWidgetDrag,
    collisionDetector: pointerIntersection,
    data: endDropData,
    disabled: !isInEditMode || hasViewportFillingWidget,
  });

  return (
    <StyledVerticalListContainer
      isInEditMode={isInEditMode}
      isInPinnedTab={isInPinnedTab}
      isMobile={isMobile}
      isSideColumnContext={isSideColumnContext}
      isOnRecordGround={isOnRecordGround}
      // What the cards are painted with is not what the list stands on. This
      // stays the surface on every page, as it always was; only the list's own
      // ground, inset and gap follow the record page. Tying the two together
      // painted the right column's cards the raised grey instead of white.
      shouldUseWhiteBackground={!isInPinnedTab || isMobile}
    >
      <WorkflowDiagramAllowPageScrollContext.Provider value={hasPageScroll}>
        {isInEditMode && isDefined(leadingElement) && (
          <StyledHeader>{leadingElement}</StyledHeader>
        )}
        {widgets.map((widget, index) => (
          <Fragment key={widget.id}>
            {isInEditMode &&
              index > 0 &&
              (!hasViewportFillingWidget ||
                index <= firstViewportFillingWidgetIndex) &&
              renderWidgetSeparator?.(widget)}
            <PageLayoutVerticalListWidgetSlot
              canAcceptWidgetDrag={canAcceptWidgetDrag}
              index={index}
              isInEditMode={isInEditMode}
              isSoloCanvasPresentation={shouldUseSoloCanvasPresentation}
              layoutMode={layoutMode}
              shouldShowDivider={isSideColumnContext}
              tabId={tabId}
              widget={widget}
            />
          </Fragment>
        ))}
        {isInEditMode && !hasViewportFillingWidget && (
          <StyledDropTarget ref={endDropZoneRef}>
            <DragDropItemDropTarget
              index={widgets.length}
              droppableId={tabId}
              orientation="horizontal"
              compact
            />
            {trailingElement}
          </StyledDropTarget>
        )}
      </WorkflowDiagramAllowPageScrollContext.Provider>
    </StyledVerticalListContainer>
  );
};
