import { SetMeetingCard } from '@/activities/calendar/components/SetMeetingCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type CalendarWidgetProps = {
  widget: PageLayoutWidget;
};

// Zone CRM: the tab arranges a meeting rather than listing them and hiding the
// form behind a button.
export const CalendarWidget = ({ widget: _widget }: CalendarWidgetProps) => (
  <WidgetContentShell>
    <SetMeetingCard />
  </WidgetContentShell>
);
