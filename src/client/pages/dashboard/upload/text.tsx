import { t } from 'i18next';
import UploadText from '@/components/pages/upload/Text';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Upload Text'));

  return <UploadText />;
}

Component.displayName = 'Dashboard/Upload/Text';
