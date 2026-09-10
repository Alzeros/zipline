import { t } from 'i18next';
import { translateApiError } from '@/lib/client/apiError';
import { Response } from '@/lib/api/response';
import { LimitedUser } from '@/lib/db/models/user';
import { fetchApi } from '@/lib/fetchApi';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconUserCancel, IconUserMinus } from '@tabler/icons-react';
import { mutate } from 'swr';

export async function deleteUser(user: LimitedUser) {
  modals.openConfirmModal({
    centered: true,
    title: t('Delete {{username}}?', { username: user.username }),
    children: t('Are you sure you want to delete {{username}}? This action cannot be undone.', {
      username: user.username,
    }),
    labels: {
      cancel: t('Cancel'),
      confirm: t('Delete'),
    },
    confirmProps: { color: 'red' },
    onConfirm: () =>
      modals.openConfirmModal({
        centered: true,
        title: t("Delete {{username}}'s data?", { username: user.username }),
        children: t("Would you like to delete {{username}}'s files and urls? This action cannot be undone.", {
          username: user.username,
        }),
        labels: {
          cancel: t('No, keep everything & only delete user'),
          confirm: t('Yes, delete everything'),
        },
        confirmProps: { color: 'red' },
        onConfirm: () => handleDeleteUser(user, true),
        onCancel: () => handleDeleteUser(user, false),
      }),
    onCancel: modals.closeAll,
  });
}

async function handleDeleteUser(user: LimitedUser, deleteFiles: boolean = false) {
  const { data, error } = await fetchApi<Response['/api/users/[id]']>(`/api/users/${user.id}`, 'DELETE', {
    delete: deleteFiles,
  });

  if (error) {
    notifications.show({
      title: t('Failed to delete user'),
      message: translateApiError(error),
      color: 'red',
      icon: <IconUserCancel size='1rem' />,
    });
  } else {
    notifications.show({
      title: t('User deleted'),
      message: t('User {{username}} has been deleted', { username: data?.username }),
      color: 'blue',
      icon: <IconUserMinus size='1rem' />,
    });
  }

  mutate('/api/users?noincl=true');
  modals.closeAll();
}
