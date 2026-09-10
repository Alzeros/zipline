import { t } from 'i18next';
import DashboardFolders from '@/components/pages/folders';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Folders'));

  return <DashboardFolders />;
}

Component.displayName = 'Dashboard/Folders';
