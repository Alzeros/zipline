import { t } from 'i18next';
import { Response } from '@/lib/api/response';
import { fetchApi } from '@/lib/fetchApi';
import { useLogout } from '@/lib/client/hooks/useLogout';
import { ActionIcon, Button, Modal, Paper, SimpleGrid, Skeleton, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconLogout, IconTrashFilled, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import useSWR from 'swr';

export default function SettingsSessions() {
  const logout = useLogout();

  const { data, isLoading, mutate } = useSWR<Response['/api/user/sessions']>('/api/user/sessions');

  const [open, setOpen] = useState(false);

  const handleLogOutOfAllDevices = async () => {
    modals.openConfirmModal({
      title: t('Log out of all devices?'),
      children: t(
        'Are you sure you want to log out of all devices? This will log you out of all devices except the current one.',
      ),
      onConfirm: async () => {
        const { error } = await fetchApi('/api/user/sessions', 'DELETE', {
          all: true,
        });

        if (!error) {
          showNotification({
            message: t('Logged out of all devices'),
            color: 'blue',
            icon: <IconLogout size='1rem' />,
          });
        }
        mutate();
      },
      labels: {
        cancel: t('Cancel'),
        confirm: t('Log out'),
      },
    });
  };

  const handleLogOutOfDevice = async (sessionId: string) => {
    modals.openConfirmModal({
      title: t('Log out of device?'),
      children: t('Are you sure you want to log out of this device?'),
      onConfirm: async () => {
        const { error } = await fetchApi('/api/user/sessions', 'DELETE', {
          sessionId,
        });

        if (!error) {
          showNotification({
            message: t('Logged out of device'),
            color: 'blue',
            icon: <IconLogout size='1rem' />,
          });
        }
        mutate();
      },
      labels: {
        cancel: t('Cancel'),
        confirm: t('Log out'),
      },
    });
  };

  const tableRows = data?.other.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td>{element.client}</Table.Td>
      <Table.Td>{element.device}</Table.Td>
      <Table.Td>{new Date(element.createdAt).toLocaleString()}</Table.Td>
      <Table.Td>
        <ActionIcon color='red' onClick={() => handleLogOutOfDevice(element.id)}>
          <IconTrashFilled size='1rem' />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal title={t('Sessions')} opened={open} onClose={() => setOpen(false)} size='lg'>
        <Paper withBorder>
          {data?.other?.length ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('Client')}</Table.Th>
                  <Table.Th>{t('Device')}</Table.Th>
                  <Table.Th>{t('Logged in at')}</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{tableRows}</Table.Tbody>
            </Table>
          ) : (
            <Text c='dimmed' p='md'>
              {t('No other sessions found')}
            </Text>
          )}
        </Paper>

        <Button
          fullWidth
          mt='sm'
          color='yellow'
          onClick={handleLogOutOfAllDevices}
          disabled={!data?.other?.length}
        >
          {t('Log out of all devices')}
        </Button>
      </Modal>

      <Paper withBorder p='sm'>
        <Title order={2}>{t('Sessions')}</Title>

        <Skeleton visible={isLoading} animate mt='sm'>
          <Text c='dimmed'>
            {/* count 必须始终是数字，否则 i18next 选不出复数变体、回落到裸 key，
                会把 {{count}} 原样显示。加载中的遮挡交给外层 Skeleton。 */}
            {t('You are currently logged into {{count}} other devices', {
              count: data?.other?.length ?? 0,
            })}
          </Text>
        </Skeleton>

        <SimpleGrid
          cols={{
            xs: 1,
            sm: 2,
          }}
          mt='sm'
        >
          <Button
            onClick={() => setOpen(true)}
            disabled={isLoading || !data?.other?.length}
            leftSection={<IconUsers size='1rem' />}
          >
            {t('View sessions')}
          </Button>

          <Button color='yellow' onClick={logout} leftSection={<IconLogout size='1rem' />}>
            {t('Log out of this browser')}
          </Button>
        </SimpleGrid>
      </Paper>
    </>
  );
}
