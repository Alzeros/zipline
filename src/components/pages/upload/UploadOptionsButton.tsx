import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { useConfig } from '@/components/ConfigProvider';
import DomainSelect from '@/components/DomainSelect';
import FolderComboboxOptions from '@/components/folders/FolderComboboxOptions';
import { Response } from '@/lib/api/response';
import { buildFolderHierarchy } from '@/lib/folderHierarchy';
import { useFolders } from '@/lib/client/hooks/useFolders';
import { useUploadOptionsStore } from '@/lib/client/store/uploadOptions';
import {
  Badge,
  Button,
  Combobox,
  Group,
  InputBase,
  Modal,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import {
  IconAlarmFilled,
  IconArrowsMinimize,
  IconEyeFilled,
  IconFileInfo,
  IconFolderPlus,
  IconKey,
  IconPercentage,
  IconSettings,
  IconTrashFilled,
  IconWriting,
} from '@tabler/icons-react';

import ms from 'ms';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { useShallow } from 'zustand/shallow';

export default function UploadOptionsButton({ folder, numFiles }: { folder?: string; numFiles: number }) {
  const config = useConfig();

  const [opened, setOpen] = useState(false);
  const [options, ephemeral, setOption, setEphemeral, changes, clearEphemeral, clearOptions] =
    useUploadOptionsStore(
      useShallow((state) => [
        state.options,
        state.ephemeral,
        state.setOption,
        state.setEphemeral,
        state.changes,
        state.clearEphemeral,
        state.clearOptions,
      ]),
    );

  const clearSettings = () => {
    clearEphemeral();
    clearOptions();
    setFolderSearch('');
  };

  const { data: folders } = useFolders();
  const { data: settingsData } = useSWR<Response['/api/server/public']>('/api/server/public');

  const combobox = useCombobox();
  const [folderSearch, setFolderSearch] = useState('');

  const folderOptions = useMemo(() => {
    if (!folders) return [];
    return buildFolderHierarchy(folders);
  }, [folders]);

  const expirations = useMemo(() => {
    const opts = [
      {
        value: 'default',
        label: t('Default ({{value}})', { value: config.files.defaultExpiration ?? t('never') }),
      },
      { value: 'never', label: t('Never') },
      { value: '5min', label: t('5 minutes') },
      { value: '10min', label: t('10 minutes') },
      { value: '15min', label: t('15 minutes') },
      { value: '30min', label: t('30 minutes') },
      { value: '1h', label: t('1 hour') },
      { value: '2h', label: t('2 hours') },
      { value: '3h', label: t('3 hours') },
      { value: '4h', label: t('4 hours') },
      { value: '5h', label: t('5 hours') },
      { value: '6h', label: t('6 hours') },
      { value: '8h', label: t('8 hours') },
      { value: '12h', label: t('12 hours') },
      { value: '1d', label: t('1 day') },
      { value: '3d', label: t('3 days') },
      { value: '5d', label: t('5 days') },
      { value: '7d', label: t('7 days') },
      { value: '1w', label: t('1 week') },
      { value: '1.5w', label: t('1.5 weeks') },
      { value: '2w', label: t('2 weeks') },
      { value: '3w', label: t('3 weeks') },
      { value: '30d', label: t('1 month (30 days)') },
      { value: '45.625d', label: t('1.5 months (~45 days)') },
      { value: '60d', label: t('2 months (60 days)') },
      { value: '90d', label: t('3 months (90 days)') },
      { value: '120d', label: t('4 months (120 days)') },
      { value: '0.5 year', label: t('6 months (0.5 year)') },
      { value: '1y', label: t('1 year') },
      {
        value: '_',
        label: t('Need more freedom? Set an exact date and time through the API.'),
        disabled: true,
      },
    ];

    try {
      const maxExp = settingsData?.files?.maxExpiration ?? null;
      if (!maxExp) return opts;

      const maxMs = ms(String(maxExp) as any);
      if (!maxMs || isNaN(Number(maxMs))) return opts;

      return opts.filter((o) => {
        if (o.value === 'never') return false;
        if (o.value === 'default' || o.value === '_') return true;
        const val = String(o.value);
        const parsed = (ms as unknown as (v: string) => number)(val);

        if (!parsed || isNaN(Number(parsed))) return true;
        return parsed <= Number(maxMs);
      });
    } catch {
      return opts;
    }
  }, [settingsData, config.files.defaultExpiration]);

  useEffect(() => {
    if (folder) return;

    // Set initial value
    if (ephemeral.folderId === null) {
      setFolderSearch('/ (Root)');
    }

    useUploadOptionsStore.subscribe(
      (state) => state.ephemeral,
      (current) => (current.folderId === null ? setFolderSearch('/ (Root)') : null),
    );
  }, []);

  return (
    <>
      <Modal centered opened={opened} onClose={() => setOpen(false)} title={t('Upload Options')}>
        <Text size='sm' c='dimmed'>
          {t('These options will be applied to all files you upload and are saved in your browser.')}
        </Text>

        <Stack gap='xs' my='sm'>
          <Select
            data={expirations}
            label={
              <>
                {t('Deletes at')}{' '}
                {options.deletesAt !== 'default' ? (
                  <Badge variant='outline' size='xs'>
                    {t('saved')}
                  </Badge>
                ) : null}
              </>
            }
            description={
              <>
                {t('The file will automatically delete itself after this time.')}{' '}
                {config.files.defaultExpiration ? (
                  <Trans
                    i18nKey='The default expiration time is <0>{{expiration}}</0> (you can override this with the below option).'
                    values={{ expiration: config.files.defaultExpiration }}
                    components={[<b key='0' />]}
                  />
                ) : (
                  <Trans
                    i18nKey='You can set a default expiration time in the <0>settings</0>.'
                    components={[<Link key='0' to='/dashboard/admin/settings' />]}
                  />
                )}
                {settingsData?.files?.maxExpiration ? (
                  <div style={{ marginTop: 6, color: 'var(--mantine-color-dimmed)' }}>
                    {t('Note: maximum allowed expiration is {{max}}.', {
                      max: settingsData.files.maxExpiration,
                    })}
                  </div>
                ) : null}
              </>
            }
            leftSection={<IconAlarmFilled size='1rem' />}
            value={options.deletesAt}
            onChange={(value) => setOption('deletesAt', value || 'default')}
            comboboxProps={{
              withinPortal: true,
              portalProps: {
                style: {
                  zIndex: 100000000,
                },
              },
            }}
          />

          <Select
            data={[
              { value: 'default', label: t('Default ({{value}})', { value: config.files.defaultFormat }) },
              { value: 'random', label: t('Random') },
              { value: 'date', label: t('Date') },
              { value: 'uuid', label: t('UUID') },
              { value: 'name', label: t('Use file name') },
              { value: 'gfycat', label: t('Gfycat-style name') },
            ]}
            label={
              <>
                {t('Name Format')}{' '}
                {options.format !== 'default' ? (
                  <Badge variant='outline' size='xs'>
                    {t('saved')}
                  </Badge>
                ) : null}
              </>
            }
            description={t(
              'The file name format to use when upload this file, the "File name" field will override this value.',
            )}
            leftSection={<IconWriting size='1rem' />}
            value={options.format}
            onChange={(value) => setOption('format', (value as any) || 'default')}
            comboboxProps={{
              withinPortal: true,
              portalProps: {
                style: {
                  zIndex: 100000000,
                },
              },
            }}
          />

          <Select
            data={[
              {
                value: 'default',
                label: t('Default ({{value}})', {
                  value: `.${config.files.defaultCompressionFormat ?? 'jpg'}`,
                }),
              },
              { value: 'jpg', label: '.jpg' },
              { value: 'png', label: '.png' },
              { value: 'webp', label: '.webp' },
              { value: 'jxl', label: '.jxl' },
            ]}
            label={
              <>
                {t('Compression Format')}{' '}
                {options.imageCompressionFormat !== 'default' ? (
                  <Badge variant='outline' size='xs'>
                    {t('saved')}
                  </Badge>
                ) : null}
              </>
            }
            description={
              <Trans
                i18nKey='The image compression format to use <0>only when a compression percent is specified</0>. Leave at "default" to use the server default compression format.'
                components={[<b key='0' />]}
              />
            }
            leftSection={<IconFileInfo size='1rem' />}
            value={options.imageCompressionFormat || 'default'}
            onChange={(value) => setOption('imageCompressionFormat', (value as any) || 'default')}
            comboboxProps={{
              withinPortal: true,
              portalProps: {
                style: {
                  zIndex: 100000000,
                },
              },
            }}
          />

          <NumberInput
            label={
              <>
                {t('Compression')}{' '}
                {options.imageCompressionPercent ? (
                  <Badge variant='outline' size='xs'>
                    {t('saved')}
                  </Badge>
                ) : null}
              </>
            }
            description={t(
              'The compression level to use on images (only). The above format will be used to compress images. Leave blank to disable compression.',
            )}
            leftSection={<IconPercentage size='1rem' />}
            max={100}
            min={0}
            value={options.imageCompressionPercent || ''}
            onChange={(value) => setOption('imageCompressionPercent', value === '' ? null : Number(value))}
          />

          <NumberInput
            label={
              <>
                {t('Max Views')}{' '}
                {options.maxViews ? (
                  <Badge variant='outline' size='xs'>
                    {t('saved')}
                  </Badge>
                ) : null}
              </>
            }
            description={t(
              'The maximum number of views the files can have before they are deleted. Leave blank to allow as many views as you want.',
            )}
            leftSection={<IconEyeFilled size='1rem' />}
            min={0}
            value={options.maxViews || ''}
            onChange={(value) => setOption('maxViews', value === '' ? null : Number(value))}
          />

          <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(value) => {
              if (value === '__root__') {
                setFolderSearch('/ (Root)');
                setEphemeral('folderId', null);
              } else {
                const selected = folderOptions.find((f) => f.id === value);
                setFolderSearch(selected?.path || '');
                setEphemeral('folderId', value);
              }
              combobox.closeDropdown();
            }}
            disabled={!!folder}
          >
            <Combobox.Target>
              <InputBase
                label={<>{t('Add to a Folder')}</>}
                description={t(
                  'Add this file to a folder. Use the "/ (Root)" option to not add the file to a folder. This value is not saved to your browser, and is cleared after uploading.',
                )}
                rightSection={<Combobox.Chevron />}
                leftSection={<IconFolderPlus size='1rem' />}
                value={folderSearch}
                onChange={(event) => {
                  combobox.openDropdown();
                  combobox.updateSelectedOptionIndex();
                  setFolderSearch(event.currentTarget.value);
                }}
                onClick={() => {
                  combobox.openDropdown();
                  setFolderSearch('');
                }}
                onFocus={() => {
                  combobox.openDropdown();
                  setFolderSearch('');
                }}
                onBlur={() => {
                  combobox.closeDropdown();
                  // Restore the selected folder path when closing
                  if (ephemeral.folderId === null) {
                    setFolderSearch('/ (Root)');
                  } else {
                    const selectedFolder = folderOptions.find((f) => f.id === ephemeral.folderId);
                    setFolderSearch(selectedFolder?.path || '');
                  }
                }}
                placeholder={t('Add to folder...')}
                rightSectionPointerEvents='none'
              />
            </Combobox.Target>

            <Combobox.Dropdown>
              <FolderComboboxOptions
                folderOptions={folderOptions}
                searchValue={folderSearch}
                additionalOptions={<Combobox.Option value='__root__'>/ (Root)</Combobox.Option>}
              />
            </Combobox.Dropdown>
          </Combobox>

          <DomainSelect
            label={
              <>
                {t('Override Domain')}{' '}
                {options.overrides_returnDomain ? (
                  <Badge variant='outline' size='xs'>
                    {t('saved')}
                  </Badge>
                ) : null}
              </>
            }
            value={options.overrides_returnDomain ?? ''}
            onChange={(value) => setOption('overrides_returnDomain', (value as string) || null)}
            comboboxProps={{
              withinPortal: true,
              portalProps: {
                style: {
                  zIndex: 100000000,
                },
              },
            }}
          />

          <TextInput
            label={t('Override File Name')}
            description={t(
              'Override the file name with this value. Leave blank to use the "Name Format" option. This value is ignored if you are uploading more than one file. This value is not saved to your browser, and is cleared after uploading.',
            )}
            leftSection={<IconFileInfo size='1rem' />}
            value={ephemeral.filename ?? ''}
            onChange={(event) =>
              setEphemeral(
                'filename',
                event.currentTarget.value.trim() === '' ? null : event.currentTarget.value.trim(),
              )
            }
            disabled={numFiles > 1}
          />

          <PasswordInput
            label={t('Password')}
            description={t(
              'Set a password for these files. Leave blank to disable password protection. This value is not saved to your browser, and is cleared after uploading.',
            )}
            leftSection={<IconKey size='1rem' />}
            value={ephemeral.password ?? ''}
            autoComplete='off'
            onChange={(event) =>
              setEphemeral(
                'password',
                event.currentTarget.value.trim() === '' ? null : event.currentTarget.value.trim(),
              )
            }
          />

          <Text c='dimmed' size='sm'>
            <b>{t('Other Options')}</b>
          </Text>

          <Switch
            label={
              <>
                {t('Add Original Name')}{' '}
                {options.addOriginalName ? (
                  <Badge variant='outline' size='xs'>
                    {t('saved')}
                  </Badge>
                ) : null}
              </>
            }
            description={t(
              'Add the original file name, so that the file can be downloaded with the original name. This will still use the "Name Format" option for its file name.',
            )}
            checked={options.addOriginalName ?? false}
            onChange={(event) => setOption('addOriginalName', event.currentTarget.checked ?? false)}
          />

          {config.files.extensionlessUrls ? (
            <Switch
              label={
                <>
                  {t('Extensionless URL')}{' '}
                  {options.extensionless ? (
                    <Badge variant='outline' size='xs'>
                      {t('saved')}
                    </Badge>
                  ) : null}
                </>
              }
              description={t(
                'Remove the file extension from the returned URL. The file can still be accessed with its extension. THis option will only work if the server is configured to allow extensionless URLs.',
              )}
              checked={options.extensionless ?? false}
              onChange={(event) => setOption('extensionless', event.currentTarget.checked ?? false)}
              disabled={!config.files.extensionlessUrls}
            />
          ) : null}
        </Stack>

        <Group justify='right' my='sm' gap='sm'>
          <Button
            variant='outline'
            color='red'
            leftSection={<IconTrashFilled size='1rem' />}
            onClick={clearSettings}
            disabled={changes() === 0}
          >
            {t('Clear')}
          </Button>

          <Button
            variant='outline'
            leftSection={<IconArrowsMinimize size='1rem' />}
            onClick={() => setOpen(false)}
          >
            {t('Close')}
          </Button>
        </Group>
      </Modal>

      <Button
        variant={changes() !== 0 ? 'light' : 'outline'}
        rightSection={changes() !== 0 ? <Badge variant='outline'>{changes()}</Badge> : null}
        onClick={() => setOpen(true)}
        leftSection={<IconSettings size='1rem' />}
      >
        {t('Options')}
      </Button>
    </>
  );
}
