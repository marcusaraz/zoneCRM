import { Helmet } from '@dr.pogodin/react-helmet';

// Zone CRM: the tab icon is the product's, whatever logo the workspace carries.
const ZONE_CRM_FAVICON = '/images/icons/android/android-launchericon-48-48.png';

export const PageFavicon = () => {
  return (
    <Helmet>
      <link rel="icon" type="image/png" href={ZONE_CRM_FAVICON} />
    </Helmet>
  );
};
