import { t } from 'i18next';
import DashboardFiles from '@/components/pages/files';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Files'));

  return <DashboardFiles />;
}

Component.displayName = 'Dashboard/Files';
