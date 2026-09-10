import { t } from 'i18next';
import { translateApiError } from '@/lib/client/apiError';
import { mutateFiles } from '@/components/file/actions';
import { Response } from '@/lib/api/response';
import { getDomain } from '@/lib/client/webDomain';
import type { File } from '@/lib/db/models/file';
import { fetchApi } from '@/lib/fetchApi';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  IconClipboardListFilled,
  IconFilesOff,
  IconStarsFilled,
  IconStarsOff,
  IconTrashFilled,
} from '@tabler/icons-react';

export async function bulkDelete(ids: string[], setSelectedFiles: (files: File[]) => void) {
  modals.openConfirmModal({
    centered: true,
    title: t('Delete {{count}} files?', { count: ids.length }),
    children: t('You are about to delete {{count}} files. This action cannot be undone.', {
      count: ids.length,
    }),
    labels: {
      cancel: t('Cancel'),
      confirm: t('Delete'),
    },
    confirmProps: { color: 'red' },
    onConfirm: async () => {
      notifications.show({
        title: t('Deleting files'),
        message: t('Deleting {{count}} files', { count: ids.length }),
        color: 'blue',
        loading: true,
        id: 'bulk-delete',
        autoClose: false,
      });

      modals.closeAll();

      const { data, error } = await fetchApi<Response['/api/user/files/transaction']>(
        '/api/user/files/transaction',
        'DELETE',
        {
          files: ids,

          delete_datasourceFiles: true,
        },
      );

      if (error) {
        notifications.update({
          title: t('Error while deleting files'),
          message: translateApiError(error),
          color: 'red',
          icon: <IconFilesOff size='1rem' />,
          id: 'bulk-delete',
          autoClose: true,
          loading: false,
        });
      } else if (data) {
        notifications.update({
          title: t('Deleted files'),
          message: t('Deleted {{count}} files', { count: data.count }),
          color: 'green',
          icon: <IconTrashFilled size='1rem' />,
          id: 'bulk-delete',
          autoClose: true,
          loading: false,
        });
      }

      setSelectedFiles([]);
      mutateFiles();
    },
    onCancel: modals.closeAll,
  });
}

export async function bulkFavorite(ids: string[], favorite: boolean) {
  // 原实现用 `${textcaps}ing` / `${textcaps}d` 拼英文词形，无法本地化，
  // 故改为收藏 / 取消收藏两套完整文案。
  const copy = favorite
    ? {
        title: t('Favorite {{count}} files?', { count: ids.length }),
        children: t('You are about to favorite {{count}} files.', { count: ids.length }),
        confirm: t('Favorite'),
        pendingTitle: t('Favoriting files'),
        pendingMessage: t('Favoriting {{count}} files', { count: ids.length }),
        doneTitle: t('Favorited files'),
        doneMessage: (count: number) => t('Favorited {{count}} files', { count }),
      }
    : {
        title: t('Unfavorite {{count}} files?', { count: ids.length }),
        children: t('You are about to unfavorite {{count}} files.', { count: ids.length }),
        confirm: t('Unfavorite'),
        pendingTitle: t('Unfavoriting files'),
        pendingMessage: t('Unfavoriting {{count}} files', { count: ids.length }),
        doneTitle: t('Unfavorited files'),
        doneMessage: (count: number) => t('Unfavorited {{count}} files', { count }),
      };

  modals.openConfirmModal({
    centered: true,
    title: copy.title,
    children: copy.children,
    labels: {
      cancel: t('Cancel'),
      confirm: copy.confirm,
    },
    confirmProps: { color: 'yellow' },
    onConfirm: async () => {
      notifications.show({
        title: copy.pendingTitle,
        message: copy.pendingMessage,
        color: 'yellow',
        loading: true,
        id: 'bulk-favorite',
        autoClose: false,
      });
      modals.closeAll();

      const { data, error } = await fetchApi<Response['/api/user/files/transaction']>(
        '/api/user/files/transaction',
        'PATCH',
        {
          files: ids,

          favorite,
        },
      );

      if (error) {
        notifications.update({
          title: t('Error while modifying files'),
          message: translateApiError(error),
          color: 'red',
          icon: <IconStarsOff size='1rem' />,
          id: 'bulk-favorite',
          autoClose: true,
          loading: false,
        });
      } else if (data) {
        notifications.update({
          title: copy.doneTitle,
          message: copy.doneMessage(data.count),
          color: 'yellow',
          icon: <IconStarsFilled size='1rem' />,
          id: 'bulk-favorite',
          autoClose: true,
          loading: false,
        });
      }

      mutateFiles();
    },
    onCancel: modals.closeAll,
  });
}

export async function bulkCopyLinks(urls: string[]) {
  const links = urls.map((url) => getDomain(url)).join('\n');

  await navigator.clipboard.writeText(links);

  notifications.show({
    title: t('Copied links to clipboard'),
    message: t('Copied {{count}} links to clipboard', { count: urls.length }),
    color: 'green',
    icon: <IconClipboardListFilled size='1rem' />,
    autoClose: true,
  });
}
