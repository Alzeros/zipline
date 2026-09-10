import { t } from 'i18next';
import type { Response } from '@/lib/api/response';
import {
  Button,
  Divider,
  LoadingOverlay,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { settingsOnSubmit } from '../settingsOnSubmit';
import useServerSettings from '../useServerSettings';

export default function Features() {
  const { data, isLoading } = useServerSettings();

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      {data ? <Form data={data} isLoading={isLoading} /> : null}
    </>
  );
}

function Form({ data, isLoading }: { data: Response['/api/server/settings']; isLoading: boolean }) {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      featuresImageCompression: data.settings.featuresImageCompression,
      featuresRobotsTxt: data.settings.featuresRobotsTxt,
      featuresHealthcheck: data.settings.featuresHealthcheck,
      featuresUserRegistration: data.settings.featuresUserRegistration,
      featuresOauthRegistration: data.settings.featuresOauthRegistration,
      featuresDeleteOnMaxViews: data.settings.featuresDeleteOnMaxViews,

      featuresThumbnailsEnabled: data.settings.featuresThumbnailsEnabled,
      featuresThumbnailsNumberThreads: data.settings.featuresThumbnailsNumberThreads,
      featuresThumbnailsFormat: data.settings.featuresThumbnailsFormat,
      featuresThumbnailsInstantaneous: data.settings.featuresThumbnailsInstantaneous,

      featuresMetricsEnabled: data.settings.featuresMetricsEnabled,
      featuresMetricsAdminOnly: data.settings.featuresMetricsAdminOnly,
      featuresMetricsShowUserSpecific: data.settings.featuresMetricsShowUserSpecific,

      featuresVersionChecking: data.settings.featuresVersionChecking,
    },
    enhanceGetInputProps: (payload) => ({
      disabled: data.tampered.includes(payload.field) || false,
    }),
  });

  const onSubmit = settingsOnSubmit(navigate, form);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap='lg'>
        <Switch
          label={t('Image Compression')}
          description={t('Allows the ability for users to compress images.')}
          {...form.getInputProps('featuresImageCompression', { type: 'checkbox' })}
        />

        <Switch
          label='/robots.txt'
          description={t('Enables a /robots.txt to stop search crawlers. Requires a server restart.')}
          {...form.getInputProps('featuresRobotsTxt', { type: 'checkbox' })}
        />

        <Switch
          label={t('Healthcheck')}
          description={t('Enables a healthcheck route for uptime monitoring. Requires a server restart.')}
          {...form.getInputProps('featuresHealthcheck', { type: 'checkbox' })}
        />

        <Switch
          label={t('User Registration')}
          description={t('Allows users to register an account on the server.')}
          {...form.getInputProps('featuresUserRegistration', { type: 'checkbox' })}
        />

        <Switch
          label={t('OAuth Registration')}
          description={t('Allows users to register an account using OAuth providers.')}
          {...form.getInputProps('featuresOauthRegistration', { type: 'checkbox' })}
        />

        <Switch
          label={t('Delete on Max Views')}
          description={t(
            'Automatically deletes files/urls after they reach the maximum view count. Requires a server restart.',
          )}
          {...form.getInputProps('featuresDeleteOnMaxViews', { type: 'checkbox' })}
        />

        <Switch
          label={t('Enable Metrics')}
          description={t('Enables metrics for the server. Requires a server restart.')}
          {...form.getInputProps('featuresMetricsEnabled', { type: 'checkbox' })}
        />

        <Switch
          label={t('Admin Only Metrics')}
          description={t('Requires an administrator to view metrics.')}
          {...form.getInputProps('featuresMetricsAdminOnly', { type: 'checkbox' })}
        />

        <Switch
          label={t('Show User Specific Metrics')}
          description={t('Shows metrics specific to each user, for all users.')}
          {...form.getInputProps('featuresMetricsShowUserSpecific', { type: 'checkbox' })}
        />

        <Divider label={t('Thumbnails')} />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
          <Switch
            label={t('Enable Thumbnails')}
            description={t('Enables thumbnail generation for images. Requires a server restart.')}
            {...form.getInputProps('featuresThumbnailsEnabled', { type: 'checkbox' })}
          />
          <Switch
            label={t('Instantaneous Thumbnails')}
            description={t(
              'Generates thumbnails immediately after a file is uploaded, instead of waiting for the task to run.',
            )}
            {...form.getInputProps('featuresThumbnailsInstantaneous', { type: 'checkbox' })}
          />
        </SimpleGrid>

        <NumberInput
          label={t('Thumbnails Number Threads')}
          description={t(
            'Number of threads to use for thumbnail generation, usually the number of CPU threads. Requires a server restart.',
          )}
          placeholder={t('Enter a number...')}
          min={1}
          max={16}
          {...form.getInputProps('featuresThumbnailsNumberThreads')}
        />

        <Select
          label={t('Thumbnails Format')}
          description={t('The output format for thumbnails. Requires a server restart.')}
          data={[
            { value: 'jpg', label: '.jpg' },
            { value: 'png', label: '.png' },
            { value: 'webp', label: '.webp' },
          ]}
          {...form.getInputProps('featuresThumbnailsFormat')}
        />

        <Divider label={t('Version Checking')} />

        <Switch
          label={t('Version Checking')}
          description={t('Query GitHub for updates and display the status on the sidebar to all users.')}
          {...form.getInputProps('featuresVersionChecking', { type: 'checkbox' })}
        />
      </Stack>

      <Button type='submit' mt='md' loading={isLoading} leftSection={<IconDeviceFloppy size='1rem' />}>
        {t('Save')}
      </Button>
    </form>
  );
}
