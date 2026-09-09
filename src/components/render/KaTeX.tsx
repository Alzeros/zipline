import { t } from 'i18next';
import { useEffect, useState } from 'react';

import 'katex/dist/katex.min.css';
import { Alert, Paper } from '@mantine/core';

export default function KaTeX({ tex }: { tex: string }) {
  const [html, setHtml] = useState('');
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    import('katex').then(({ default: { renderToString } }) => {
      try {
        const html = renderToString(tex, { throwOnError: true });
        setHtml(html);
      } catch (err) {
        setError(err);
      }
    });
  }, [tex]);

  if (error) {
    return (
      <Alert color='red' title={t('KaTeX error')}>
        {error.toString()}
      </Alert>
    );
  }

  return (
    <Paper withBorder p='md'>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Paper>
  );
}
