import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { Anchor, Code, Modal, Text } from '@mantine/core';

export default function SecureWarningModal({
  returnHttps,
  opened,
  onClose,
}: {
  returnHttps: boolean;
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={t('HTTPS Configuration')} size='lg'>
      <Text>
        {returnHttps
          ? t(
              'It appears that you are accessing this instance through an insecure context (HTTP), but the server is configured to use HTTPS. This can lead to issues when logging in, as secure cookies may not be sent by the browser.',
            )
          : t(
              'It appears that you are accessing this instance through a secure context (HTTPS), but the server is not configured to use HTTPS. This can lead issues when logging in.',
            )}
      </Text>
      <Text mt='md'>
        {returnHttps ? (
          <Trans
            i18nKey='To resolve this issue, please access this instance through HTTPS. If that is currently not possible, you can temporarily set the <0>CORE_RETURN_HTTPS_URLS</0> environment variable to <1>false</1>.'
            components={[<Code key='0' />, <Code key='1' />]}
          />
        ) : (
          <Trans
            i18nKey='To resolve this issue, it is recommended to have your server configured to use HTTPS. This can be done by setting the <0>CORE_RETURN_HTTPS_URLS</0> environment variable to <1>true</1> and ensuring that your server has a valid SSL setup through a reverse proxy like Nginx or Caddy.'
            components={[<Code key='0' />, <Code key='1' />]}
          />
        )}
      </Text>

      <Text mt='md'>
        <Trans
          i18nKey='After making these changes, restart the server for the changes to take effect. If you continue to experience issues, please consult the <0>documentation</0> or seek support.'
          components={[
            <Anchor
              key='0'
              underline='always'
              href='https://zipline.diced.sh/docs/config/settings#more-about-return-https-urls'
            />,
          ]}
        />
      </Text>
    </Modal>
  );
}
