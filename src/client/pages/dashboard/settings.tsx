import { t } from 'i18next';
import DashboardSettings from '@/components/pages/settings';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Settings'));

  return <DashboardSettings />;
}

Component.displayName = 'Dashboard/Settings';
