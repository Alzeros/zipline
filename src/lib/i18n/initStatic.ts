import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';
import { SSR_VIEW_LOCALE } from './index';

/**
 * 给公开分享页（/view/:id、/view/url/:id）用的固定语言初始化。
 *
 * 这两个页面既在服务端渲染，也在浏览器端 hydrate，因此不能用带语言探测的
 * initI18n()：
 *   - 服务端没有 localStorage / navigator，探测器无从判断；
 *   - 若服务端渲染英文而客户端探测出中文，两边 DOM 不一致，会触发 hydration
 *     不匹配。
 * 真正做到「按访问者语言渲染」需要读取 Accept-Language 并为每个请求隔离
 * i18next 实例（共享单例在并发请求下会串语言），这里先不做。
 *
 * 目前固定用 SSR_VIEW_LOCALE，服务端和客户端取同一个值，两边必然一致。
 *
 * 之所以必须初始化而不是干脆不接入：未初始化时 i18next.t() 返回 undefined，
 * React 会把它渲染成空白——那比显示英文原文还糟。
 */
export function initI18nStatic() {
  if (i18next.isInitialized) return i18next;

  i18next.use(initReactI18next).init({
    resources: { en: { translation: en }, 'zh-CN': { translation: zhCN } },
    lng: SSR_VIEW_LOCALE,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-CN'],
    load: 'currentOnly',
    nonExplicitSupportedLngs: false,
    interpolation: { escapeValue: false },
    parseMissingKeyHandler: (key) => key,
    returnNull: false,
  });

  return i18next;
}
