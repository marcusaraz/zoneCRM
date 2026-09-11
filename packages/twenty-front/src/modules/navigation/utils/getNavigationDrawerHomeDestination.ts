import { type GetNavigationDrawerHomeDestinationParams } from '@/navigation/types/GetNavigationDrawerHomeDestinationParams';

/**
 * Home goes home.
 *
 * It used to return you to wherever you were before you stepped into settings
 * or the chat, which meant the button did something different every time and
 * never took you to the first screen. Zone CRM opens on the dashboard, and so
 * does this.
 */
export const getNavigationDrawerHomeDestination = ({
  defaultHomePagePath,
}: GetNavigationDrawerHomeDestinationParams) => defaultHomePagePath;
