import { t } from 'i18next';
import DashboardServerActions from '@/components/pages/serverActions';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Server Actions'));

  return <DashboardServerActions />;
}

Component.displayName = 'Dashboard/Admin/Actions';
