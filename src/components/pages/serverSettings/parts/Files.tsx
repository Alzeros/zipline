import { t } from 'i18next';
import type { Response } from '@/lib/api/response';
import { Button, LoadingOverlay, NumberInput, Select, Stack, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { checkCommaArray, settingsOnSubmit } from '../settingsOnSubmit';
import useServerSettings from '../useServerSettings';

export default function Files() {
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
      filesRoute: data.settings.filesRoute,
      filesLength: data.settings.filesLength,
      filesDefaultFormat: data.settings.filesDefaultFormat,
      filesDisabledTypes: data.settings.filesDisabledTypes.join(', '),
      filesDisabledTypesDefault: data.settings.filesDisabledTypesDefault,
      filesDisabledExtensions: data.settings.filesDisabledExtensions.join(', '),
      filesMaxFileSize: data.settings.filesMaxFileSize,
      filesDefaultExpiration: data.settings.filesDefaultExpiration,
      filesMaxExpiration: data.settings.filesMaxExpiration,
      filesAssumeMimetypes: data.settings.filesAssumeMimetypes,
      filesDefaultDateFormat: data.settings.filesDefaultDateFormat,
      filesRemoveGpsMetadata: data.settings.filesRemoveGpsMetadata,
      filesRandomWordsNumAdjectives: data.settings.filesRandomWordsNumAdjectives,
      filesRandomWordsSeparator: data.settings.filesRandomWordsSeparator,
      filesDefaultCompressionFormat: data.settings.filesDefaultCompressionFormat,
      filesMaxFilesPerUpload: data.settings.filesMaxFilesPerUpload,
      filesExtensionlessUrls: data.settings.filesExtensionlessUrls,
    },
    enhanceGetInputProps: (payload) => ({
      disabled: data.tampered.includes(payload.field) || false,
    }),
  });

  const onSubmit = async (values: typeof form.values) => {
    if (values.filesDefaultExpiration?.trim() === '' || !values.filesDefaultExpiration) {
      values.filesDefaultExpiration = null;
    } else {
      values.filesDefaultExpiration = values.filesDefaultExpiration.trim();
    }

    if (values.filesMaxExpiration?.trim() === '' || !values.filesMaxExpiration) {
      values.filesMaxExpiration = null;
    } else {
      values.filesMaxExpiration = values.filesMaxExpiration.trim();
    }

    if (values.filesDisabledTypesDefault?.trim() === '' || !values.filesDisabledTypesDefault) {
      values.filesDisabledTypesDefault = null;
    } else {
      values.filesDisabledTypesDefault = values.filesDisabledTypesDefault.trim();
    }

    // @ts-ignore
    values.filesDisabledExtensions = checkCommaArray(values.filesDisabledExtensions);
    // @ts-ignore
    values.filesDisabledTypes = checkCommaArray(values.filesDisabledTypes);

    return settingsOnSubmit(navigate, form)(values);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap='lg'>
        <Switch
          label={t('Assume Mimetypes')}
          description={t('Assume the mimetype of a file for its extension.')}
          {...form.getInputProps('filesAssumeMimetypes', { type: 'checkbox' })}
        />

        <TextInput
          label={t('Disabled Types')}
          description='Mimetypes to disable, separated by commas. It is recommended to have the Assume Mimetypes setting enabled if you are disabling mimetypes, as this will also block files with the corresponding extensions.'
          placeholder='text/html, application/javascript'
          {...form.getInputProps('filesDisabledTypes')}
        />

        <TextInput
          label={t('Default MIME for Disabled Types')}
          description='The default MIME type to use for disabled types. Leave blank to completely block disabled types.'
          placeholder='application/octet-stream'
          {...form.getInputProps('filesDisabledTypesDefault')}
        />

        <Switch
          label={t('Remove GPS Metadata')}
          description={t('Remove GPS metadata from files.')}
          {...form.getInputProps('filesRemoveGpsMetadata', { type: 'checkbox' })}
        />

        <Switch
          label={t('Extensionless URLs')}
          description='Allow file links without the extension (e.g. /u/uuid instead of /u/uuid.png). Upload responses still include the extension.'
          {...form.getInputProps('filesExtensionlessUrls', { type: 'checkbox' })}
        />

        <TextInput
          label='Route'
          description={t('The route to use for file uploads. Requires a server restart.')}
          placeholder='/u'
          {...form.getInputProps('filesRoute')}
        />

        <NumberInput
          label='Length'
          description={t('The length of the file name (for randomly generated names).')}
          min={1}
          max={64}
          {...form.getInputProps('filesLength')}
        />

        <Select
          label={t('Default Format')}
          description={t('The default format to use for file names.')}
          placeholder='random'
          data={['random', 'date', 'uuid', 'name', 'gfycat']}
          {...form.getInputProps('filesDefaultFormat')}
        />

        <TextInput
          label={t('Disabled Extensions')}
          description={t('Extensions to disable, separated by commas.')}
          placeholder='exe, bat, sh'
          {...form.getInputProps('filesDisabledExtensions')}
        />

        <TextInput
          label={t('Max File Size')}
          description={t('The maximum file size allowed.')}
          placeholder='100mb'
          {...form.getInputProps('filesMaxFileSize')}
        />

        <TextInput
          label={t('Default Date Format')}
          description={t('The default date format to use.')}
          placeholder='YYYY-MM-DD_HH:mm:ss'
          {...form.getInputProps('filesDefaultDateFormat')}
        />

        <TextInput
          label={t('Default Expiration')}
          description={t('The default expiration time for files.')}
          placeholder='30d'
          {...form.getInputProps('filesDefaultExpiration')}
        />

        <TextInput
          label={t('Max Expiration')}
          description={t('The maximum expiration time allowed for files.')}
          placeholder='365d'
          {...form.getInputProps('filesMaxExpiration')}
        />

        <NumberInput
          label={t('Random Words Num Adjectives')}
          description={t('The number of adjectives to use for the random-words/gfycat format.')}
          min={1}
          max={10}
          {...form.getInputProps('filesRandomWordsNumAdjectives')}
        />

        <TextInput
          label={t('Random Words Separator')}
          description={t('The separator to use for the random-words/gfycat format.')}
          placeholder='-'
          {...form.getInputProps('filesRandomWordsSeparator')}
        />

        <Select
          label={t('Default Compression Format')}
          description={t(
            'The default image compression format to use when only a compression percent is specified.',
          )}
          placeholder='jpg'
          data={[
            { value: 'jpg', label: '.jpg' },
            { value: 'png', label: '.png' },
            { value: 'webp', label: '.webp' },
            { value: 'jxl', label: '.jxl' },
          ]}
          {...form.getInputProps('filesDefaultCompressionFormat')}
        />

        <NumberInput
          label={t('Max Files Per Upload')}
          description={t('The maximum number of files allowed per upload. Requires a server restart.')}
          min={1}
          {...form.getInputProps('filesMaxFilesPerUpload')}
        />
      </Stack>

      <Button type='submit' mt='md' loading={isLoading} leftSection={<IconDeviceFloppy size='1rem' />}>
        {t('Save')}
      </Button>
    </form>
  );
}
