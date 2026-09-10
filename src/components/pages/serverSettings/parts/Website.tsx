import { t } from 'i18next';
import type { Response } from '@/lib/api/response';
import { Button, JsonInput, LoadingOverlay, Stack, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { settingsOnSubmit } from '../settingsOnSubmit';
import useServerSettings from '../useServerSettings';

export default function Website() {
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
      websiteTitle: data.settings.websiteTitle,
      websiteTitleLogo: data.settings.websiteTitleLogo,
      websiteExternalLinks: JSON.stringify(data.settings.websiteExternalLinks, null, 2),
      websiteLoginBackground: data.settings.websiteLoginBackground,
      websiteLoginBackgroundBlur: data.settings.websiteLoginBackgroundBlur,
      websiteDefaultAvatar: data.settings.websiteDefaultAvatar,
      websiteTos: data.settings.websiteTos,

      websiteThemeDefault: data.settings.websiteThemeDefault,
      websiteThemeDark: data.settings.websiteThemeDark,
      websiteThemeLight: data.settings.websiteThemeLight,
    },
    enhanceGetInputProps: (payload) => ({
      disabled: data.tampered.includes(payload.field) || false,
    }),
  });

  const onSubmit = async (values: typeof form.values) => {
    const sendValues: Record<string, any> = {};

    if (values.websiteExternalLinks?.trim() === '' || !values.websiteExternalLinks) {
      // @ts-ignore
      sendValues.websiteExternalLinks = [];
    } else {
      // @ts-ignore
      try {
        sendValues.websiteExternalLinks = JSON.parse(values.websiteExternalLinks);
      } catch {
        form.setFieldError('websiteExternalLinks', t('Invalid JSON'));
      }
    }

    sendValues.websiteTitleLogo =
      values.websiteTitleLogo?.trim() === '' || !values.websiteTitleLogo?.trim()
        ? null
        : values.websiteTitleLogo.trim();
    sendValues.websiteLoginBackground =
      values.websiteLoginBackground?.trim() === '' || !values.websiteLoginBackground?.trim()
        ? null
        : values.websiteLoginBackground.trim();
    sendValues.websiteDefaultAvatar =
      values.websiteDefaultAvatar?.trim() === '' || !values.websiteDefaultAvatar?.trim()
        ? null
        : values.websiteDefaultAvatar.trim();
    sendValues.websiteTos =
      values.websiteTos?.trim() === '' || !values.websiteTos?.trim() ? null : values.websiteTos.trim();

    sendValues.websiteThemeDefault = values.websiteThemeDefault.trim();
    sendValues.websiteThemeDark = values.websiteThemeDark.trim();
    sendValues.websiteThemeLight = values.websiteThemeLight.trim();
    sendValues.websiteTitle = values.websiteTitle.trim();

    sendValues.websiteLoginBackgroundBlur = values.websiteLoginBackgroundBlur;

    return settingsOnSubmit(navigate, form)(sendValues);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap='lg'>
        <TextInput
          label={t('Title')}
          description={t('The title of the website in browser tabs and at the top.')}
          placeholder='Zipline'
          {...form.getInputProps('websiteTitle')}
        />

        <TextInput
          label={t('Title Logo')}
          description={t('The URL to use for the title logo. This is placed to the left of the title.')}
          placeholder='https://example.com/logo.png'
          {...form.getInputProps('websiteTitleLogo')}
        />

        <JsonInput
          label={t('External Links')}
          description={t(
            'The external links to show in the footer. This must be valid JSON in the format of an array of objects with "name" and "url" properties. For example: [{"name": "GitHub", "url": "https://github.com/diced/zipline"}]',
          )}
          formatOnBlur
          minRows={1}
          maxRows={7}
          autosize
          placeholder={JSON.stringify(
            [
              { name: 'GitHub', url: 'https://github.com/diced/zipline' },
              { name: t('Documentation'), url: 'https://zipline.diced.sh' },
            ],
            null,
            2,
          )}
          {...form.getInputProps('websiteExternalLinks')}
        />

        <TextInput
          label={t('Login Background')}
          description={t('The URL to use for the login background.')}
          placeholder='https://example.com/background.png'
          {...form.getInputProps('websiteLoginBackground')}
        />

        <Switch
          label={t('Login Background Blur')}
          description={t('Whether to blur the login background.')}
          {...form.getInputProps('websiteLoginBackgroundBlur', { type: 'checkbox' })}
        />

        <TextInput
          label={t('Default Avatar')}
          description={t(
            'The path to use for the default avatar. This must be a path to an image, not a URL.',
          )}
          placeholder='/zipline/avatar.png'
          {...form.getInputProps('websiteDefaultAvatar')}
        />

        <TextInput
          label={t('Terms of Service')}
          description={t('Path to a Markdown (.md) file to use for the terms of service.')}
          placeholder='/zipline/TOS.md'
          {...form.getInputProps('websiteTos')}
        />

        <TextInput
          label={t('Default Theme')}
          description={t('The default theme to use for the website.')}
          placeholder='system'
          {...form.getInputProps('websiteThemeDefault')}
        />

        <TextInput
          label={t('Dark Theme')}
          description={t('The dark theme to use for the website when the default theme is "system".')}
          placeholder='builtin:dark_gray'
          {...form.getInputProps('websiteThemeDark')}
        />

        <TextInput
          label={t('Light Theme')}
          description={t('The light theme to use for the website when the default theme is "system".')}
          placeholder='builtin:light_gray'
          {...form.getInputProps('websiteThemeLight')}
        />
      </Stack>
      <Button type='submit' mt='md' loading={isLoading} leftSection={<IconDeviceFloppy size='1rem' />}>
        {t('Save')}
      </Button>
    </form>
  );
}
