import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '简体中文' },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['code'];

export const LOCALE_STORAGE_KEY = 'zipline_locale';

// 采用英文原文作为翻译 key：未命中翻译时 i18next 回落到 key 本身，
// 即原始英文，因此「未翻译」表现为显示英文而非报错或空白。
//
// 但含插值的 key 无法这样回落 —— 直接显示 key 会把 {{count}} 之类的
// 占位符原样暴露给用户。en.json 仅收录这类带插值的条目，让英文语言下
// 也能正常完成插值；其余条目继续依赖 key 回落，无需重复维护。
const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
};

// 仅供浏览器端使用。两个 SSR 入口（ssr-view / ssr-view-url）暂不接入 i18n：
// 它们渲染的是公开分享页，面向的是链接接收者而非本站用户，且服务端渲染
// 需按请求隔离实例，否则并发请求之间会串语言。
export function initI18n() {
  if (i18next.isInitialized) return i18next;

  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LOCALES.map((l) => l.code),
      // 不做 zh-CN → zh 的降级查找，避免命中不存在的 zh 资源
      load: 'currentOnly',
      nonExplicitSupportedLngs: false,
      interpolation: {
        // React 已对插值内容做转义，此处再转义会导致双重转义
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: LOCALE_STORAGE_KEY,
        caches: ['localStorage'],
      },
      // 缺失的 key 回落为 key 本身（英文原文），不输出警告噪音
      parseMissingKeyHandler: (key) => key,
      returnNull: false,
    });

  return i18next;
}

export function setLocale(code: LocaleCode) {
  i18next.changeLanguage(code);
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch {
    // 隐私模式下 localStorage 可能不可写，忽略即可
  }
}

export default i18next;
