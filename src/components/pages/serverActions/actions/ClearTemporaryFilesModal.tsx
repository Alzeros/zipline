import { t } from 'i18next';
import { Response } from '@/lib/api/response';
import { fetchApi } from '@/lib/fetchApi';
import { Button, Group, Modal, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconTrashFilled } from '@tabler/icons-react';

export default function ClearTemporaryFilesModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const handle = async () => {
    onClose();

    const { data, error } = await fetchApi<Response['/api/server/clear_temp']>(
      '/api/server/clear_temp',
      'DELETE',
    );

    if (!error && data) {
      showNotification({
        message: data.status,
        icon: <IconTrashFilled size='1rem' />,
      });
    }
  };

  return (
    <Modal title={t('Are you sure?')} opened={opened} onClose={onClose}>
      <Text>
        This will delete temporary files stored within the temporary directory (defined in the configuration).
        {t('This should not cause harm unless there are files that are being processed still.')}
      </Text>

      <Group justify='flex-end' mt='md'>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='red' onClick={handle}>
          {t('Yes, delete')}
        </Button>
      </Group>
    </Modal>
  );
}
