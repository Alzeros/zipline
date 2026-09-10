// 公开分享页（ssr-view / ssr-view-url）的 i18next 初始化，必须是各入口的第一个 import。
//
// 与 ./i18n-init.ts 同理：ES 模块按源码顺序求值，排在最前的 import 会先执行完
// 模块体。这些页面组件在模块级就调用 t()，若初始化晚于它们，t() 返回 undefined，
// React 渲染出来是空白。
//
// 与 ./i18n-init.ts 的区别是不带语言探测——服务端渲染和客户端 hydrate 必须
// 用同一种语言，否则 DOM 对不上。详见 @/lib/i18n/initStatic。
import { initI18nStatic } from '@/lib/i18n/initStatic';

initI18nStatic();
