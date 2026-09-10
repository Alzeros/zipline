import { t } from 'i18next';
import type { Response } from '@/lib/api/response';
import { Button, ColorInput, Group, LoadingOverlay, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { settingsOnSubmit } from '../settingsOnSubmit';
import useServerSettings from '../useServerSettings';

export default function PWA() {
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
      pwaEnabled: data.settings.pwaEnabled,
      pwaTitle: data.settings.pwaTitle,
      pwaShortName: data.settings.pwaShortName,
      pwaDescription: data.settings.pwaDescription,
      pwaThemeColor: data.settings.pwaThemeColor,
      pwaBackgroundColor: data.settings.pwaBackgroundColor,
    },
    enhanceGetInputProps: (payload: any): object => ({
      disabled:
        data.tampered.includes(payload.field) ||
        (payload.field !== 'pwaEnabled' && !form.values.pwaEnabled) ||
        false,
    }),
  });

  const onSubmit = async (values: typeof form.values) => {
    const sendValues: Record<string, any> = {};

    sendValues.pwaTitle = values.pwaTitle.trim() === '' ? null : values.pwaTitle.trim();
    sendValues.pwaShortName = values.pwaShortName.trim() === '' ? null : values.pwaShortName.trim();
    sendValues.pwaDescription = values.pwaDescription.trim() === '' ? null : values.pwaDescription.trim();

    return settingsOnSubmit(
      navigate,
      form,
    )({
      ...sendValues,
      pwaEnabled: values.pwaEnabled,
      pwaThemeColor: values.pwaThemeColor,
      pwaBackgroundColor: values.pwaBackgroundColor,
    });
  };

  return (
    <>
      <Text size='sm' c='dimmed' mb='md'>
        {t('Refresh the page after enabling PWA to see any changes.')}
      </Text>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap='lg'>
          <Switch
            label={t('PWA Enabled')}
            description={t('Allow users to install the Zipline PWA on their devices.')}
            {...form.getInputProps('pwaEnabled', { type: 'checkbox' })}
          />

          <TextInput
            label={t('Title')}
            description={t('The title for the PWA')}
            placeholder='Zipline'
            {...form.getInputProps('pwaTitle')}
          />

          <TextInput
            label={t('Short Name')}
            description={t('The short name for the PWA')}
            placeholder='Zipline'
            {...form.getInputProps('pwaShortName')}
          />

          <TextInput
            label={t('Description')}
            description={t('The description for the PWA')}
            placeholder='Zipline'
            {...form.getInputProps('pwaDescription')}
          />

          <ColorInput
            label={t('Theme Color')}
            description={t('The theme color for the PWA')}
            placeholder='#000000'
            {...form.getInputProps('pwaThemeColor')}
          />

          <ColorInput
            label={t('Background Color')}
            description={t('The background color for the PWA')}
            placeholder='#ffffff'
            {...form.getInputProps('pwaBackgroundColor')}
          />
        </Stack>
        <Group mt='md'>
          <Button type='submit' loading={isLoading} leftSection={<IconDeviceFloppy size='1rem' />}>
            {t('Save')}
          </Button>
          <Button onClick={() => window.location.reload()} leftSection={<IconRefresh size='1rem' />}>
            {t('Refresh')}
          </Button>
        </Group>
      </form>
    </>
  );
}
