import { t } from 'i18next';
import DashboardAdminHome from '@/components/pages/admin';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Administrator'));

  return <DashboardAdminHome />;
}

Component.displayName = 'Dashboard/Admin';
