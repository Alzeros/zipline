import { t } from 'i18next';
import GridTableSwitcher from '@/components/GridTableSwitcher';
import { Response } from '@/lib/api/response';
import { Invite } from '@/lib/db/models/invite';
import { fetchApi } from '@/lib/fetchApi';
import { useViewStore } from '@/lib/client/store/view';
import { Button, Group, Modal, NumberInput, Select, Stack, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTagOff } from '@tabler/icons-react';
import { useState } from 'react';
import { mutate } from 'swr';
import InviteGridView from './views/InviteGridView';
import InviteTableView from './views/InviteTableView';

export default function DashboardInvites() {
  const view = useViewStore((state) => state.invites);
  const [open, setOpen] = useState(false);

  const form = useForm<{
    maxUses: number | '';
    expiresAt: string;
  }>({
    initialValues: {
      maxUses: '',
      expiresAt: 'never',
    },
  });

  const onSubmit = async (values: typeof form.values) => {
    const send = {
      expiresAt: values.expiresAt,
      ...(values.maxUses && { maxUses: values.maxUses === 0 ? null : values.maxUses }),
    };

    const { data, error } = await fetchApi<Extract<Response['/api/auth/invites'], Invite>>(
      '/api/auth/invites',
      'POST',
      send,
    );

    if (error) {
      notifications.show({
        message: error.error,
        color: 'red',
        icon: <IconTagOff size='1rem' />,
      });
    } else {
      notifications.show({
        title: t('Invite created'),
        message: `Invite ${data?.code} has been created.`,
        color: 'green',
        icon: <IconPlus size='1rem' />,
      });

      mutate('/api/auth/invites');
      setOpen(false);
      form.reset();
    }
  };

  return (
    <>
      <Modal centered opened={open} onClose={() => setOpen(false)} title={t('Create an invite')}>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap='sm'>
            <Select
              label={t('Expires at')}
              description='Select an expiration for this invite, or choose "never" if you want the invite to never expire.'
              placeholder={t('Select an expiration...')}
              data={[
                { value: 'never', label: t('Never') },
                { value: '30min', label: '30 minutes' },
                { value: '1h', label: '1 hour' },
                { value: '6h', label: '6 hours' },
                { value: '12h', label: '12 hours' },
                { value: '1d', label: t('1 day') },
                { value: '3d', label: '3 days' },
                { value: '5d', label: '5 days' },
                { value: '7d', label: t('7 days') },
              ]}
              comboboxProps={{
                withinPortal: true,
                portalProps: {
                  style: {
                    zIndex: 100000000,
                  },
                },
              }}
              {...form.getInputProps('expiresAt')}
            />
            <NumberInput
              label={t('Max uses')}
              description={t(
                'Set a maximum number of uses for this invite, or leave blank for unlimited uses.',
              )}
              placeholder={t('Enter a number...')}
              min={1}
              {...form.getInputProps('maxUses')}
            />

            <Button type='submit' variant='outline' fullWidth leftSection={<IconPlus size='1rem' />}>
              {t('Create')}
            </Button>
          </Stack>
        </form>
      </Modal>

      <Group>
        <Title>{t('Invites')}</Title>

        <Button
          variant='outline'
          size='compact-sm'
          leftSection={<IconPlus size='1rem' />}
          onClick={() => setOpen(true)}
        >
          {t('Create')}
        </Button>

        <GridTableSwitcher type='invites' />
      </Group>

      {view === 'grid' ? <InviteGridView /> : <InviteTableView />}
    </>
  );
}
