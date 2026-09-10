import { t } from 'i18next';
import Markdown from '@/components/render/Markdown';
import { Response } from '@/lib/api/response';
import { Container, LoadingOverlay } from '@mantine/core';
import useSWR from 'swr';
import GenericError from '../../error/GenericError';
import { useTitle } from '@/lib/client/hooks/useTitle';

export function Component() {
  useTitle(t('Terms of Service'));

  const {
    data: config,
    error,
    isLoading,
  } = useSWR<Response['/api/server/public']>('/api/server/public', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenHidden: false,
    revalidateIfStale: false,
  });

  if (isLoading) return <LoadingOverlay visible />;

  if (error) {
    return (
      <GenericError
        title={t('Error loading TOS')}
        message={t('Could not load Terms of Service file...')}
        details={error}
      />
    );
  }

  return (
    <Container my='lg'>
      <Markdown md={config?.tos || ''} />
    </Container>
  );
}

Component.displayName = 'Tos';
