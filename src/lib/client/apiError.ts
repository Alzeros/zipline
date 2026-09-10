import { t } from 'i18next';
import { API_ERRORS, type ApiErrorCode, type ApiErrorPayload } from '@/lib/api/errors';

/**
 * 把接口返回的错误转成当前语言的文案。
 *
 * 服务端的错误文案是 API_ERRORS 里的英文常量，无法在服务端按请求语言渲染
 * （那需要解析 Accept-Language 并按请求隔离 i18next 实例）。但响应里带了
 * 数字 code，所以客户端可以用 code 反查英文原文，再把它当作 i18n key 翻译
 * —— 与本项目其余部分「英文原文即 key」的约定一致，无需额外维护映射表。
 *
 * 保留 `E<code>` 前缀：它与日志、文档中的错误码对应，便于排查。
 *
 * 无法识别 code 的情况（例如 fastify/zod 的 schema 校验消息）原样返回，
 * 至少不会丢失信息。
 */
export function translateApiError(
  error?: Pick<ApiErrorPayload, 'error' | 'code'> | null,
  fallback?: string,
): string {
  if (!error) return fallback ?? t('An unknown error occurred');

  const original = API_ERRORS[error.code as ApiErrorCode];
  if (!original) return error.error ?? fallback ?? t('An unknown error occurred');

  return `E${error.code}: ${t(original)}`;
}
