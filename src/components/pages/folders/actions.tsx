import { t } from 'i18next';
import { translateApiError } from '@/lib/client/apiError';
import { Response } from '@/lib/api/response';
import { copyLink } from '@/lib/client/copyLink';
import { Folder } from '@/lib/db/models/folder';
import { fetchApi } from '@/lib/fetchApi';
import { getDomain } from '@/lib/client/webDomain';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconFolderOff } from '@tabler/icons-react';
import { mutate } from 'swr';

export function copyFolderUrl(folder: Folder, clipboard: ReturnType<typeof useClipboard>) {
  const url = getDomain(`/folder/${folder.id}`);
  copyLink(url, clipboard, `/folder/${folder.id}`);
}

export async function editFolderVisibility(folder: Folder, isPublic: boolean) {
  const { data, error } = await fetchApi<Response['/api/user/folders/[id]']>(
    `/api/user/folders/${folder.id}`,
    'PATCH',
    {
      isPublic,
    },
  );

  if (error) {
    notifications.show({
      title: t('Failed to edit folder visibility'),
      message: translateApiError(error),
      color: 'red',
      icon: <IconFolderOff size='1rem' />,
    });
  } else {
    notifications.show({
      title: t('Folder visibility edited'),
      message: isPublic
        ? t('{{name}} is now public', { name: data?.name })
        : t('{{name}} is now private', { name: data?.name }),
      color: 'green',
      icon: <IconCheck size='1rem' />,
    });
  }

  mutateFolder();
}

export async function editFolderUploads(folder: Folder, allowUploads: boolean) {
  const { data, error } = await fetchApi<Response['/api/user/folders/[id]']>(
    `/api/user/folders/${folder.id}`,
    'PATCH',
    {
      allowUploads,
    },
  );

  if (error) {
    notifications.show({
      title: t('Failed to edit folder uploads policy'),
      message: translateApiError(error),
      color: 'red',
      icon: <IconFolderOff size='1rem' />,
    });
  } else {
    notifications.show({
      title: t('Folder uploads policy edited'),
      message: allowUploads
        ? t('{{name}} will now allow anonymous uploads', { name: data?.name })
        : t('{{name}} will no longer allow anonymous uploads', { name: data?.name }),
      color: 'green',
      icon: <IconCheck size='1rem' />,
    });
  }

  mutateFolder();
}

export async function mutateFolder(folderId?: string) {
  if (folderId) return mutate(`/api/user/folders/${folderId}`);

  return mutate((key) => typeof key === 'string' && key.startsWith('/api/user/folders'));
}
