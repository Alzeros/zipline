import { t } from 'i18next';
import { translateApiError } from '@/lib/client/apiError';
import { Trans } from 'react-i18next';
import RelativeDate from '@/components/RelativeDate';
import { fetchApi } from '@/lib/fetchApi';
import useObjectState from '@/lib/client/hooks/useObjectState';
import { useUserStore } from '@/lib/client/store/user';
import { UserPasskey } from '@/prisma/client';
import { ActionIcon, Button, Group, Modal, Paper, Stack, Text, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
  startRegistration,
} from '@simplewebauthn/browser';
import { IconKey, IconKeyOff, IconTrashFilled } from '@tabler/icons-react';
import { mutate } from 'swr';

export default function PasskeyButton() {
  const user = useUserStore((state) => state.user);
  const [pkData, setPkData] = useObjectState<{
    open: boolean;
    error: string | null;
    loading: boolean;

    nameShown: boolean;
    savedKey: RegistrationResponseJSON | null;
    name: string;
  }>({
    open: false,
    error: null,
    loading: false,

    nameShown: false,
    savedKey: null,
    name: '',
  });

  const handleRegisterPasskey = async () => {
    try {
      const { data } = await fetchApi<PublicKeyCredentialCreationOptionsJSON>(
        '/api/user/mfa/passkey/options',
        'GET',
      );

      setPkData('loading', true);
      const res = await startRegistration({ optionsJSON: data! });
      setPkData({
        nameShown: true,
        savedKey: res,
      });
    } catch (e: any) {
      setPkData({
        error: e.message ?? t('An error occurred while creating a passkey'),
        loading: false,
        savedKey: null,
      });

      setTimeout(() => {
        setPkData('error', null);
      }, 10000);
    }
  };

  const handleSavePasskey = async () => {
    if (!pkData.savedKey) return;

    const { error } = await fetchApi('/api/user/mfa/passkey', 'POST', {
      response: pkData.savedKey,
      name: pkData.name.trim(),
    });

    if (error) {
      setPkData({
        nameShown: false,
        savedKey: null,
        error: '',
        loading: false,
      });

      notifications.show({
        title: t('Error while saving passkey'),
        message: translateApiError(error),
        color: 'red',
        icon: <IconKeyOff size='1rem' />,
      });
    } else {
      setPkData({
        nameShown: false,
        loading: false,
        savedKey: null,
        open: false,
      });

      notifications.show({
        title: t('Passkey saved!'),
        message: t('Your passkey has been saved successfully.'),
        color: 'green',
        icon: <IconKey size='1rem' />,
      });

      mutate('/api/user');
    }
  };

  const removePasskey = async (passkey: UserPasskey) => {
    modals.openConfirmModal({
      title: t('Are you sure?'),
      children: t(
        'Your browser and device may still show "{{name}}" as an option to log in. If you want to remove it, you\'ll have to do so manually through your device\'s settings.',
        { name: passkey.name },
      ),
      labels: {
        confirm: t('Remove "{{name}}"', { name: passkey.name }),
        cancel: t('Cancel'),
      },
      confirmProps: {
        color: 'red',
      },
      onConfirm: async () => {
        const { error } = await fetchApi('/api/user/mfa/passkey', 'DELETE', {
          id: passkey.id,
        });

        if (error) {
          notifications.show({
            title: t('Error while removing passkey'),
            message: translateApiError(error),
            color: 'red',
            icon: <IconKeyOff size='1rem' />,
          });
        } else {
          notifications.show({
            title: t('Passkey removed!'),
            message: t('Your passkey has been removed successfully.'),
            color: 'green',
            icon: <IconKey size='1rem' />,
          });

          mutate('/api/user');
        }
      },
    });
  };

  return (
    <>
      <Modal title={t('Manage passkeys')} opened={pkData.open} onClose={() => setPkData('open', false)}>
        <Stack gap='sm'>
          <>
            {user?.passkeys?.map((passkey, i) => (
              <Paper withBorder p='xs' key={i}>
                <Group justify='space-between'>
                  <Text fw='bolder'>{passkey.name}</Text>
                  <ActionIcon color='red' onClick={() => removePasskey(passkey)}>
                    <IconTrashFilled size='1rem' />
                  </ActionIcon>
                </Group>
                <Text size='sm'>
                  <Trans
                    i18nKey='Passkey created <0/>'
                    components={[<RelativeDate key='0' date={passkey.createdAt} />]}
                  />
                  {passkey.lastUsed && (
                    <Trans
                      i18nKey=', last used <0/>.'
                      components={[<RelativeDate key='0' date={passkey.lastUsed} />]}
                    />
                  )}
                </Text>
                {!(passkey?.reg as Record<string, any>).webauthn && (
                  <Text size='xs' mt='xs' c='red'>
                    <Trans
                      i18nKey='Warning: This passkey was created with an older version of Zipline and <0>WILL NOT</0> work with this version. Please delete and recreate this passkey to ensure compatibility.'
                      components={[<b key='0' />]}
                    />
                  </Text>
                )}
              </Paper>
            ))}
          </>
          <Button
            size='sm'
            leftSection={<IconKey size='1rem' />}
            color={pkData.error ? 'red' : undefined}
            onClick={handleRegisterPasskey}
            loading={pkData.loading}
            disabled={!!pkData.error}
          >
            {pkData.error
              ? t('Error while creating a passkey - try again later')
              : pkData.loading
                ? t('Loading...')
                : t('Create a passkey')}
          </Button>
          {pkData.error && (
            <Text size='xs' c='red'>
              {pkData.error}
            </Text>
          )}

          {pkData.nameShown && (
            <>
              <Text size='sm'>{t('Assign a name to this passkey so you can remember it later.')}</Text>

              <TextInput
                placeholder={t('Passkey name')}
                value={pkData.name}
                onChange={(e) => setPkData('name', e.currentTarget.value)}
              />

              <Button
                size='sm'
                leftSection={<IconKey size='1rem' />}
                color='blue'
                onClick={handleSavePasskey}
              >
                {t('Save')}
              </Button>
            </>
          )}
        </Stack>
      </Modal>

      <Button size='sm' leftSection={<IconKey size='1rem' />} onClick={() => setPkData('open', true)}>
        {t('Manage passkeys')}
      </Button>
    </>
  );
}
