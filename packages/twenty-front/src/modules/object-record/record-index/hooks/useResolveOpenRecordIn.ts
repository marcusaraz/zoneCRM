import { OpenRecordIn } from 'twenty-shared/types';

/**
 * A record opens on its own page.
 *
 * This used to follow a stored preference, and the preference was set to the
 * side panel. The setting that changed it is gone, so clicking a customer on a
 * task did nothing anyone could see: the panel it opened was behind the screen
 * they were already reading. One behaviour, and it is the one people expect
 * from a name they click.
 */
export const useResolveOpenRecordIn = (_objectNameSingular: string) =>
  OpenRecordIn.RECORD_PAGE;
