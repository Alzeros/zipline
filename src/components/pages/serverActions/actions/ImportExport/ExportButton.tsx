import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { Alert, Box, Button, List, Modal, Code, Group, Divider, Checkbox, Pill } from '@mantine/core';
import { IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { useState } from 'react';

export default function ExportButton() {
  const [open, setOpen] = useState(false);

  const [noMetrics, setNoMetrics] = useState(false);

  return (
    <>
      <Modal opened={open} onClose={() => setOpen(false)} size='lg' title={t('Are you sure?')}>
        <Box px='sm'>
          <p>
            {t("The export provides a complete snapshot of Zipline's data and environment. It includes:")}
          </p>

          <List>
            <List.Item>
              <b>{t('Users:')}</b>{' '}
              {t(
                'Account information including usernames, optional passwords, avatars, roles, view settings, and optional TOTP secrets.',
              )}
            </List.Item>

            <List.Item>
              <b>{t('Passkeys:')}</b>{' '}
              {t(
                'Registered WebAuthn passkeys with creation dates, last-used timestamps, and credential registration data.',
              )}
            </List.Item>

            <List.Item>
              <b>{t('User Quotas:')}</b>{' '}
              {t('Quota settings such as max bytes, max files, max URLs, and quota types.')}
            </List.Item>

            <List.Item>
              <b>{t('OAuth Providers:')}</b>{' '}
              {t('Linked OAuth accounts including provider type, tokens, and OAuth IDs.')}
            </List.Item>

            <List.Item>
              <b>{t('User Tags:')}</b>{' '}
              {t('Tags created by users, including names, colors, and associated file IDs.')}
            </List.Item>

            <List.Item>
              <b>{t('Files:')}</b>{' '}
              {t(
                'Metadata about uploaded files including size, type, timestamps, expiration, views, password protection, owner, and folder association.',
              )}
              <i> {t('(Actual file contents are not included.)')}</i>
            </List.Item>

            <List.Item>
              <b>{t('Folders:')}</b>{' '}
              {t(
                'Folder metadata including visibility settings, upload permissions, file lists, and ownership.',
              )}
            </List.Item>

            <List.Item>
              <b>{t('URLs:')}</b>{' '}
              {t(
                'Metadata for shortened URLs including destinations, vanity codes, view counts, passwords, and user assignments.',
              )}
            </List.Item>

            <List.Item>
              <b>{t('Thumbnails:')}</b> {t('Thumbnail path and associated file ID.')}
              <i> {t('(Image data is not included.)')}</i>
            </List.Item>

            <List.Item>
              <b>{t('Invites:')}</b> {t('Invite codes, creation/expiration dates, and usage counts.')}
            </List.Item>

            <List.Item>
              <b>{t('Metrics:')}</b> {t('System and usage statistics stored internally by Zipline.')}
            </List.Item>
          </List>

          <p>
            <Trans
              i18nKey='Additionally, the export includes <0>system-specific information</0>:'
              components={[<b key='0' />]}
            />
          </p>

          <List>
            <List.Item>
              <b>{t('CPU Count:')}</b> {t('The number of available processor cores.')}
            </List.Item>
            <List.Item>
              <b>{t('Hostname:')}</b> {t("The host system's network identifier.")}
            </List.Item>
            <List.Item>
              <b>{t('Architecture:')}</b>{' '}
              <Trans
                i18nKey='The hardware architecture (e.g., <0>x64</0>, <1>arm64</1>).'
                components={[<Code key='0' />, <Code key='1' />]}
              />
            </List.Item>
            <List.Item>
              <b>{t('Platform:')}</b>{' '}
              <Trans
                i18nKey='The operating system platform (e.g., <0>linux</0>, <1>darwin</1>).'
                components={[<Code key='0' />, <Code key='1' />]}
              />
            </List.Item>
            <List.Item>
              <b>{t('OS Release:')}</b> {t('The OS or kernel version.')}
            </List.Item>
            <List.Item>
              <b>{t('Environment Variables:')}</b>{' '}
              {t('A full snapshot of environment variables at the time of export.')}
            </List.Item>
            <List.Item>
              <b>{t('Versions:')}</b> {t('The Zipline version, Node version, and export format version.')}
            </List.Item>
          </List>

          <Divider my='md' />

          <Checkbox
            label={t('Exclude Metrics Data')}
            description={t(
              'Exclude system and usage metrics from the export. This can reduce the export file size.',
            )}
            checked={noMetrics}
            onChange={() => setNoMetrics((val) => !val)}
          />

          <Divider my='md' />

          <Alert color='red' icon={<IconAlertCircle size='1rem' />} title={t('Warning')} my='md'>
            {t(
              'This export contains a significant amount of sensitive data, including user accounts, authentication credentials, environment variables, and system metadata. Handle this file securely and do not share it with untrusted parties.',
            )}
          </Alert>

          <Group grow my='md'>
            <Button onClick={() => setOpen(false)} color='red'>
              {t('Cancel')}
            </Button>
            <Button
              component='a'
              href={`/api/server/export${noMetrics ? '?nometrics=true' : ''}`}
              target='_blank'
              rel='noreferrer'
              leftSection={<IconDownload size='1rem' />}
              onClick={() => setOpen(false)}
            >
              {t('Download Export')}
            </Button>
          </Group>
        </Box>
      </Modal>

      <Button
        size='xl'
        fullWidth
        onClick={() => setOpen(true)}
        leftSection={<IconDownload size='1rem' />}
        rightSection={<Pill>V4</Pill>}
      >
        {t('Export Data')}
      </Button>
    </>
  );
}
