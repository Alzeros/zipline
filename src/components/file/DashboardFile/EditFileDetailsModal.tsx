import { t } from 'i18next';
import { translateApiError } from '@/lib/client/apiError';
import { Trans } from 'react-i18next';
import { File } from '@/lib/db/models/file';
import { fetchApi } from '@/lib/fetchApi';
import useObjectState from '@/lib/client/hooks/useObjectState';
import { Button, Divider, Modal, NumberInput, PasswordInput, Stack, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconEye, IconKey, IconPencil, IconPencilOff, IconTrashFilled } from '@tabler/icons-react';
import { useEffect } from 'react';
import { mutateFiles } from '../actions';

export default function EditFileDetailsModal({
  file,
  onClose,
  open,
}: {
  open: boolean;
  file: File | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useObjectState<{
    name: string;
    maxViews: number | null;
    password: string | null;
    originalName: string | null;
    type: string | null;
  }>({
    name: file?.name ?? '',
    maxViews: file?.maxViews ?? null,
    password: file?.password ? '' : null,
    originalName: file?.originalName ?? null,
    type: file?.type ?? null,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: file?.name ?? '',
        maxViews: file?.maxViews ?? null,
        password: file?.password ? '' : null,
        originalName: file?.originalName ?? null,
        type: file?.type ?? null,
      });
    } else {
      setFormData({
        name: '',
        maxViews: null,
        password: null,
        originalName: null,
        type: null,
      });
    }
  }, [open, file]);

  if (!file) return null;

  const handleRemovePassword = async () => {
    if (!file.password) return;

    const { error } = await fetchApi(`/api/user/files/${file.id}`, 'PATCH', {
      password: null,
    });

    if (error) {
      showNotification({
        title: t('Failed to remove password...'),
        message: translateApiError(error),
        color: 'red',
        icon: <IconPencilOff size='1rem' />,
      });
    } else {
      showNotification({
        title: t('Password removed!'),
        message: t('The password has been removed from the file.'),
        color: 'green',
        icon: <IconPencil size='1rem' />,
      });

      mutateFiles();
    }
  };

  const handleSave = async () => {
    const data: {
      maxViews?: number;
      password?: string;
      originalName?: string;
      type?: string;
      name?: string;
    } = {};

    if (formData.maxViews !== null) data['maxViews'] = formData.maxViews;
    if (formData.originalName !== null) data['originalName'] = formData.originalName?.trim();
    if (formData.type !== null) data['type'] = formData.type?.trim();
    if (formData.name !== file.name) data['name'] = formData.name.trim();

    const passwordTrimmed = formData.password?.trim();
    if (passwordTrimmed !== '') data['password'] = passwordTrimmed;

    const { error } = await fetchApi(`/api/user/files/${file.id}`, 'PATCH', data);

    if (error) {
      showNotification({
        title: t('Failed to save changes...'),
        message: translateApiError(error),
        color: 'red',
        icon: <IconPencilOff size='1rem' />,
      });
    } else {
      showNotification({
        title: t('Changes saved!'),
        message: t('The changes to the file have been saved.'),
        color: 'green',
        icon: <IconPencil size='1rem' />,
      });

      onClose();

      setFormData('password', null);
      mutateFiles();
    }
  };

  return (
    <Modal zIndex={400} title={t('Editing "{{name}}"', { name: file.name })} onClose={onClose} opened={open}>
      <Stack gap='xs' my='sm'>
        <TextInput
          label={t('Name')}
          description={t('Rename the file.')}
          value={formData.name}
          onChange={(event) => setFormData('name', event.currentTarget.value.trim())}
        />

        <NumberInput
          label={t('Max Views')}
          placeholder={t('Unlimited')}
          description={t(
            'The maximum number of views this file can have before it is deleted. Leave blank to allow as many views as you want.',
          )}
          min={0}
          value={formData.maxViews || ''}
          onChange={(value) => setFormData('maxViews', value === '' ? null : Number(value))}
          leftSection={<IconEye size='1rem' />}
        />

        <TextInput
          label={t('Original Name')}
          description={t(
            'Add an original name. When downloading this file, instead of using the generated file name (if chosen), it will download with this "original name" instead.',
          )}
          value={formData.originalName ?? ''}
          onChange={(event) =>
            setFormData(
              'originalName',
              event.currentTarget.value.trim() === '' ? null : event.currentTarget.value.trim(),
            )
          }
        />

        <TextInput
          label={t('Type')}
          description={
            <Trans
              i18nKey="Change a file's mimetype. <0>DO NOT CHANGE THIS VALUE</0> unless you know what you are doing, this can mess with how Zipline renders specific file types."
              components={[<b key='0' />]}
            />
          }
          value={formData.type ?? ''}
          onChange={(event) =>
            setFormData(
              'type',
              event.currentTarget.value.trim() === '' ? null : event.currentTarget.value.trim(),
            )
          }
          c='red'
        />

        <Divider />

        {file.password ? (
          <Button
            variant='light'
            color='red'
            leftSection={<IconTrashFilled size='1rem' />}
            onClick={handleRemovePassword}
          >
            {t('Remove Password')}
          </Button>
        ) : (
          <PasswordInput
            label={t('Password')}
            description={t('Set a password for this file. Leave blank to disable password protection.')}
            value={formData.password ?? ''}
            autoComplete='off'
            onChange={(event) =>
              setFormData(
                'password',
                event.currentTarget.value.trim() === '' ? null : event.currentTarget.value.trim(),
              )
            }
            leftSection={<IconKey size='1rem' />}
          />
        )}

        <Divider />

        <Button onClick={handleSave} leftSection={<IconPencil size='1rem' />}>
          {t('Save changes')}
        </Button>
      </Stack>
    </Modal>
  );
}
