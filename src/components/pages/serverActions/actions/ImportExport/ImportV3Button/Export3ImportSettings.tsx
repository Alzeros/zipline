import { t } from 'i18next';
import { Export3, V3_COMPATIBLE_SETTINGS } from '@/lib/import/version3/validateExport';
import { Box, Checkbox, Group, Text } from '@mantine/core';

export default function Export3ImportSettings({
  export3,
  setImportSettings,
  importSettings,
}: {
  export3: Export3;
  setImportSettings: (importSettings: boolean) => void;
  importSettings: boolean;
}) {
  const commonSettings = Object.keys(V3_COMPATIBLE_SETTINGS).filter((key) => key in export3.request.env);

  return (
    <Box my='lg'>
      <Text size='md'>{t('Import settings?')}</Text>
      <Text size='sm' c='dimmed'>
        {t('This option allows you to import compatible settings from your instance into this v4 instance.')}
      </Text>

      <Checkbox.Card
        checked={importSettings}
        onClick={() => setImportSettings(!importSettings)}
        radius='md'
        my='sm'
      >
        <Group wrap='nowrap' align='flex-start'>
          <Checkbox.Indicator m='md' />
          <Text my='sm'>{t('Import {{count}} settings', { count: commonSettings.length })}</Text>
        </Group>
      </Checkbox.Card>
    </Box>
  );
}
