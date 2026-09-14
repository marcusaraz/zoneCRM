import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';

// The Stitch screens fix the sidebar at 240 (pm/briefs/zone-crm-desktop/
// people-table.html, w-60). This is the width a fresh browser gets; the width
// is kept per browser once somebody drags it, so an existing one keeps what it
// has until it is dragged again.
export const NAVIGATION_DRAWER_CONSTRAINTS: ResizablePanelConstraints = {
  min: 180,
  max: 350,
  default: 240,
};
