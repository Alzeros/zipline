import { extname } from 'path';
import sharp from 'sharp';
import { log } from './logger';

const logger = log('compress');

export const COMPRESS_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'jxl'] as const;
export type CompressType = (typeof COMPRESS_TYPES)[number];

export type CompressResult = {
  mimetype: string;
  ext: CompressType;
  buffer: Buffer;

  failed?: boolean;
};

export type CompressOptions = {
  quality: number;
  type?: CompressType;
};

export function checkOutput(type: CompressType): boolean {
  if (type === 'jpg') type = 'jpeg';

  return !!(sharp.format as any)[type]?.output?.file && !!(sharp.format as any)[type]?.output?.buffer;
}

export type ResolvedCompression = { type: CompressType; percent: number };

// 自动压缩时采用的编码质量（sharp 的 quality，1-100）
export const AUTO_COMPRESS_QUALITY = 80;

// 自动压缩需跳过的类型：
//   svg —— 矢量图，经 sharp 转码会被栅格化，不可逆
//   ico —— 多尺寸图标容器，转码只会保留其中一个尺寸
const AUTO_COMPRESS_SKIP_MIMES = ['image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];

/**
 * 决定某次上传最终采用的图片压缩参数。
 *
 * 上游仅在客户端显式发送 x-zipline-image-compression-percent 时才压缩，
 * 致使 FEATURES_IMAGE_COMPRESSION 与 FILES_DEFAULT_COMPRESSION_FORMAT
 * 在服务端形同虚设。此函数让该开关真正生效：客户端未指定时，按配置的
 * 默认格式自动压缩。
 *
 * 上传流程中「生成文件名」与「实际压缩」位于两个独立的循环，必须共用
 * 同一判断，否则会出现文件名后缀与实际内容格式不一致。
 */
export function resolveImageCompression(
  // 入参沿用 parseHeaders 的宽松类型（type 可缺省），返回值则保证 type 必定有值
  mimetype: string,
  requested: { type?: CompressType; percent: number } | undefined,
  opts: { enabled: boolean; defaultFormat: CompressType },
): ResolvedCompression | undefined {
  // 客户端显式指定时一律尊重其意图，不做格式过滤
  if (requested) return { type: requested.type ?? opts.defaultFormat, percent: requested.percent };

  if (!opts.enabled) return undefined;
  if (!mimetype.startsWith('image/')) return undefined;
  if (AUTO_COMPRESS_SKIP_MIMES.includes(mimetype)) return undefined;
  if (!checkOutput(opts.defaultFormat)) return undefined;

  // 已是目标格式则跳过，避免二次有损编码
  const alreadyTarget =
    mimetype === `image/${opts.defaultFormat}` ||
    (['jpg', 'jpeg'].includes(opts.defaultFormat) && mimetype === 'image/jpeg');
  if (alreadyTarget) return undefined;

  return { type: opts.defaultFormat, percent: AUTO_COMPRESS_QUALITY };
}

export async function compressFile(filePath: string, options: CompressOptions): Promise<CompressResult> {
  try {
    const { quality, type } = options;

    const animated = ['.gif', '.webp', '.avif', '.tiff'].includes(extname(filePath).toLowerCase());

    const image = sharp(filePath, { animated }).withMetadata();

    const result: CompressResult = {
      mimetype: '',
      ext: 'jpg',
      buffer: Buffer.alloc(0),
    };

    let buffer: Buffer;

    switch (type?.toLowerCase()) {
      case 'png':
        buffer = await image.png({ quality }).toBuffer();
        result.mimetype = 'image/png';
        result.ext = 'png';
        break;
      case 'webp':
        buffer = await image.webp({ quality }).toBuffer();
        result.mimetype = 'image/webp';
        result.ext = 'webp';
        break;
      case 'jxl':
        buffer = await image.jxl({ quality }).toBuffer();
        result.mimetype = 'image/jxl';
        result.ext = 'jxl';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        buffer = await image.jpeg({ quality }).toBuffer();
        result.mimetype = 'image/jpeg';
        result.ext = 'jpg';
        break;
    }

    return {
      ...result,
      buffer,
    };
  } catch (error) {
    logger.error(`failed to compress file: ${error}`);

    return {
      mimetype: '',
      ext: 'jpg',
      buffer: Buffer.alloc(0),
      failed: true,
    };
  }
}
