import { t } from 'i18next';
import DashboardInvites from '@/components/pages/invites';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Invites'));

  return <DashboardInvites />;
}

Component.displayName = 'Dashboard/Admin/Invites';
