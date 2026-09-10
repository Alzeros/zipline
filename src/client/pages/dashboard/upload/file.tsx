import { t } from 'i18next';
import UploadFile from '@/components/pages/upload/File';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Upload File'));

  return <UploadFile />;
}

Component.displayName = 'Dashboard/Upload/File';
