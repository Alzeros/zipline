import { t } from 'i18next';
import DashboardURLs from '@/components/pages/urls';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('URLs'));

  return <DashboardURLs />;
}

Component.displayName = 'Dashboard/URLs';
