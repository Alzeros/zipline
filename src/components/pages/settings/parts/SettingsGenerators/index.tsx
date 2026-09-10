import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { Anchor, Code, Group, Paper, Text, Title, Image as MantineImage } from '@mantine/core';
import { IconPrompt } from '@tabler/icons-react';
import GeneratorButton from './GeneratorButton';
import { Link } from 'react-router-dom';

export default function SettingsGenerators() {
  return (
    <Paper withBorder p='sm'>
      <Title order={2}>{t('Generate Uploaders')}</Title>
      <Text size='sm' c='dimmed' mt={3}>
        {t(
          'Generate scripts for upload tools. The Flameshot and Shell Script generators are supported on only Linux and macOS.',
        )}
      </Text>

      <Group mt='xs'>
        <GeneratorButton
          name='ShareX'
          icon={
            <img width={24} height={24} alt='sharex logo' src='https://getsharex.com/img/ShareX_Logo.svg' />
          }
        />
        <GeneratorButton
          name='Flameshot'
          icon={
            <img width={24} height={24} alt='flameshot logo' src='https://flameshot.org/flameshot-icon.svg' />
          }
          desc={
            <Trans
              i18nKey='To use this script, you need <0>Flameshot</0>, <1/>, <2/>, and <3/> installed. This script is intended for use on Linux and macOS only (see options below).'
              components={[
                <Anchor key='0' component={Link} to='https://flameshot.org' />,
                <Anchor key='1' component={Link} to='https://curl.se/'>
                  <Code>curl</Code>
                </Anchor>,
                <Anchor key='2' component={Link} to='https://github.com/stedolan/jq'>
                  <Code>jq</Code>
                </Anchor>,
                <Anchor key='3' component={Link} to='https://github.com/astrand/xclip'>
                  <Code>xclip</Code> {t('(linux only)')}
                </Anchor>,
              ]}
            />
          }
        />
        <GeneratorButton
          name='ishare'
          icon={
            <MantineImage
              width={24}
              height={24}
              alt={t('ishare logo')}
              src='https://raw.githubusercontent.com/itoolio/ishare/refs/tags/v4.2.5/ishare/Util/Assets.xcassets/AppIcon.appiconset/AppIcon-128.png'
            />
          }
          desc={
            <Trans
              i18nKey='This generator requires <0>ishare</0> to be installed on macOS. This uploader is intended for use on macOS only.'
              components={[<Anchor key='0' href='https://isharemac.app/' />]}
            />
          }
        />
        <GeneratorButton
          name='Shell Script'
          icon={<IconPrompt size={24} />}
          desc={
            <Trans
              i18nKey='To use this script, you need <0>bash</0>, <1/>, <2/>, <3/>, and <4/> installed. This script is intended for use on Linux and macOS only (see options below).'
              components={[
                <Code key='0' />,
                <Anchor key='1' component={Link} to='https://curl.se/'>
                  <Code>curl</Code>
                </Anchor>,
                <Anchor key='2' component={Link} to='https://darwinsys.com/file/'>
                  <Code>file</Code>
                </Anchor>,
                <Anchor key='3' component={Link} to='https://github.com/stedolan/jq'>
                  <Code>jq</Code>
                </Anchor>,
                <Anchor key='4' component={Link} to='https://github.com/astrand/xclip'>
                  <Code>xclip</Code> {t('(linux only)')}
                </Anchor>,
              ]}
            />
          }
        />
      </Group>
    </Paper>
  );
}
