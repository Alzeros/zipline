import { t } from 'i18next';
import { Response } from '@/lib/api/response';
import { fetchApi } from '@/lib/fetchApi';
import { Button, Group, Modal, Stack, Switch } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconFileSearch } from '@tabler/icons-react';
import { useState } from 'react';

export default function RequeryFileSizesModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const handle = async () => {
    onClose();
    setForceUpdate(false);
    setForceDelete(false);

    const { data, error } = await fetchApi<Response['/api/server/requery_size']>(
      '/api/server/requery_size',
      'POST',
      {
        forceUpdate,
        forceDelete,
      },
    );

    if (!error && data) {
      showNotification({
        message: data.status,
        icon: <IconFileSearch size='1rem' />,
      });
    }
  };

  return (
    <Modal title={t('Are you sure?')} opened={opened} onClose={onClose}>
      <Stack mb='md'>
        <span>
          {t(
            'This will requery the size of every file stored within the database. Additionally you can use the options below.',
          )}
        </span>

        <Switch
          label={t('Force Update')}
          description={t('Force update the size of every file, even if it already has a size set.')}
          checked={forceUpdate}
          onChange={() => setForceUpdate((val) => !val)}
          color='red'
        />

        <Switch
          label={t('Force Delete')}
          description={t('Delete files that are not found in the database, or have a size of 0.')}
          checked={forceDelete}
          onChange={() => setForceDelete((val) => !val)}
          color='red'
        />
      </Stack>

      <Group justify='flex-end'>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='red' onClick={handle}>
          {t('Requery')}
        </Button>
      </Group>
    </Modal>
  );
}
