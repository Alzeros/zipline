import { t } from 'i18next';
import { translateApiError } from '@/lib/client/apiError';
import { Trans } from 'react-i18next';
import { Response } from '@/lib/api/response';
import { User } from '@/lib/db/models/user';
import { fetchApi } from '@/lib/fetchApi';
import { useUserStore } from '@/lib/client/store/user';
import {
  Anchor,
  Box,
  Button,
  Center,
  Code,
  Image,
  LoadingOverlay,
  Modal,
  PinInput,
  Stack,
  Text,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconShieldLockFilled } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { useShallow } from 'zustand/shallow';

export default function TwoFAButton() {
  const size = useMediaQuery('(max-width: 600px)') ? 'sm' : 'xl';
  const [user, setUser] = useUserStore(useShallow((state) => [state.user, state.setUser]));

  const [totpOpen, setTotpOpen] = useState(false);
  const {
    data: mfaData,
    error: mfaError,
    isLoading: mfaLoading,
  } = useSWR<Extract<Response['/api/user/mfa/totp'], { secret: string; qrcode: string }>>(
    totpOpen && !user?.totpEnabled ? '/api/user/mfa/totp' : null,
    null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  const [pinDisabled, setPinDisabled] = useState(false);
  const [pinError, setPinError] = useState('');

  const enable2fa = async (pin: string) => {
    if (pin.length !== 6) return setPinError(t('Invalid pin'));

    const { data, error } = await fetchApi<Extract<Response['/api/user/mfa/totp'], User>>(
      '/api/user/mfa/totp',
      'POST',
      {
        code: pin,
        secret: mfaData!.secret,
      },
    );

    if (error) {
      setPinError(translateApiError(error));
      setPinDisabled(false);
    } else {
      setTotpOpen(false);
      setPinDisabled(false);
      mutate('/api/user');
      setUser(data);

      notifications.show({
        title: t('2FA Enabled'),
        message: t('You have successfully enabled 2FA on your account.'),
        color: 'green',
        icon: <IconShieldLockFilled size='1rem' />,
      });
    }
  };

  const disable2fa = async (pin: string) => {
    if (pin.length !== 6) return setPinError(t('Invalid pin'));

    const { data, error } = await fetchApi<Extract<Response['/api/user/mfa/totp'], User>>(
      '/api/user/mfa/totp',
      'DELETE',
      {
        code: pin,
      },
    );

    if (error) {
      setPinError(translateApiError(error));
      setPinDisabled(false);
    } else {
      setTotpOpen(false);
      setPinDisabled(false);
      mutate('/api/user');
      setUser(data);

      notifications.show({
        title: t('2FA Disabled'),
        message: t('You have successfully disabled 2FA on your account.'),
        color: 'green',
        icon: <IconShieldLockFilled size='1rem' />,
      });
    }
  };

  const handlePinChange = (value: string) => {
    if (value.length === 6) {
      setPinDisabled(true);
      user?.totpEnabled ? disable2fa(value) : enable2fa(value);
    } else {
      setPinError('');
    }
  };

  return (
    <>
      <Modal
        title={
          user?.totpEnabled ? t('Disable Two-Factor Authentication') : t('Enable Two-Factor Authentication')
        }
        opened={totpOpen}
        onClose={() => setTotpOpen(false)}
        size='md'
      >
        <Stack gap='sm'>
          {user?.totpEnabled ? (
            <Text size='sm' c='dimmed'>
              {t('Enter the 6-digit code from your authenticator app below to confirm disabling 2FA.')}
            </Text>
          ) : (
            <>
              <Text size='sm' c='dimmed'>
                <b>{t('Step 1')}</b>{' '}
                <Trans
                  i18nKey='Open/download an authenticator that supports QR code scanning or manual code entry. Popular options include <0>2FAs</0>, <1>Google Authenticator</1>, <2>Microsoft Authenticator</2>, and <3>Apple Passwords</3>.'
                  components={[
                    <Anchor key='0' component={Link} to='https://2fas.com/' target='_blank' />,
                    <Anchor
                      key='1'
                      component={Link}
                      to='https://support.google.com/accounts/answer/1066447'
                      target='_blank'
                    />,
                    <Anchor
                      key='2'
                      component={Link}
                      to='https://www.microsoft.com/en-us/security/mobile-authenticator-app'
                      target='_blank'
                    />,
                    <Anchor
                      key='3'
                      component={Link}
                      to='https://support.apple.com/guide/iphone/automatically-fill-in-verification-codes-ipha6173c19f/ios'
                      target='_blank'
                    />,
                  ]}
                />
              </Text>

              <Text size='sm' c='dimmed'>
                <b>{t('Step 2')}</b> {t('Scan the QR code below with your authenticator app to enable 2FA.')}
              </Text>

              <Box pos='relative'>
                {mfaLoading && !mfaError ? (
                  <Box w={180} h={180}>
                    <LoadingOverlay visible pos='relative' />
                  </Box>
                ) : (
                  <Center>
                    <Image h={180} w={180} src={mfaData?.qrcode} alt={t('QR code') + ' ' + mfaData?.secret} />
                  </Center>
                )}
              </Box>

              <Text size='sm' c='dimmed'>
                {t(
                  "If you can't scan the QR code, you can manually enter the following code into your authenticator app:",
                )}{' '}
                <Code>{mfaData?.secret ?? ''}</Code>
              </Text>

              <Text size='sm' c='dimmed'>
                <b>{t('Step 3')}</b>{' '}
                {t('Enter the 6-digit code from your authenticator app below to confirm 2FA setup.')}
              </Text>
            </>
          )}

          <Center>
            <PinInput
              data-autofocus
              length={6}
              oneTimeCode
              type='number'
              placeholder=''
              onChange={handlePinChange}
              autoFocus={true}
              error={!!pinError}
              disabled={pinDisabled}
              size={size}
            />
          </Center>
          {pinError && (
            <Text ta='center' size='sm' c='red' mt={0}>
              {pinError}
            </Text>
          )}
        </Stack>
      </Modal>

      <Button
        size='sm'
        leftSection={<IconShieldLockFilled size='1rem' />}
        color={user?.totpEnabled ? 'red' : undefined}
        onClick={() => setTotpOpen(true)}
      >
        {user?.totpEnabled ? t('Disable 2FA') : t('Enable 2FA')}
      </Button>
    </>
  );
}
