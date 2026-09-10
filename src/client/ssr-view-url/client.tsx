// 必须是第一个 import：这些页面在模块级调用 t()，i18next 需先完成初始化，
// 否则 t() 返回 undefined，页面上会渲染成空白。详见该文件内注释。
import '../i18n-init-view';

import '@mantine/charts/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';

import ZiplineSSRProvider from '@/components/ZiplineSSRProvider';
import { ZIPLINE_SSR_PROP } from '@/lib/ssr/constants';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoutes } from './routes';

const router = createBrowserRouter(createRoutes());

const initialData = (window as any)[ZIPLINE_SSR_PROP];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ZiplineSSRProvider ssrData={initialData}>
      <RouterProvider router={router} />
    </ZiplineSSRProvider>
  </StrictMode>,
);
