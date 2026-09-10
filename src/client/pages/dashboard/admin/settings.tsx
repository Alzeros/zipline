import { t } from 'i18next';
import DashboardServerSettings from '@/components/pages/serverSettings';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Server Settings'));

  return <DashboardServerSettings />;
}

Component.displayName = 'Dashboard/Admin/Settings';
