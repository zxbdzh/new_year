/**
 * 截图分享工具
 * Feature: new-year-fireworks-game
 * 
 * 提供Canvas截图、下载和分享功能
 */

/**
 * 截图选项
 */
export interface ScreenshotOptions {
  /** 图片格式 */
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** 图片质量（0-1，仅对jpeg和webp有效） */
  quality?: number;
  /** 文件名 */
  filename?: string;
}

/**
 * 分享选项
 */
export interface ShareOptions {
  /** 分享标题 */
  title?: string;
  /** 分享文本 */
  text?: string;
  /** 分享URL */
  url?: string;
}

/**
 * 截图分享器类
 * 
 * 提供Canvas截图、下载和分享功能
 */
export class ScreenshotSharer {
  private canvas: HTMLCanvasElement;

  /**
   * 构造函数
   * @param canvas Canvas元素
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /**
   * 捕获Canvas截图为DataURL
   * @param options 截图选项
   * @returns DataURL字符串
   */
  captureAsDataURL(options: ScreenshotOptions = {}): string {
    const {
      format = 'image/png',
      quality = 0.92,
    } = options;

    return this.canvas.toDataURL(format, quality);
  }

  /**
   * 捕获Canvas截图为Blob
   * @param options 截图选项
   * @returns Promise<Blob>
   */
  async captureAsBlob(options: ScreenshotOptions = {}): Promise<Blob> {
    const {
      format = 'image/png',
      quality = 0.92,
    } = options;

    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        format,
        quality
      );
    });
  }

  /**
   * 下载截图
   * @param options 截图选项
   */
  async download(options: ScreenshotOptions = {}): Promise<void> {
    const {
      format = 'image/png',
      quality = 0.92,
      filename = `fireworks-${Date.now()}.${this.getFileExtension(format)}`,
    } = options;

    try {
      const blob = await this.captureAsBlob({ format, quality });
      const url = URL.createObjectURL(blob);

      // 创建临时下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Failed to download screenshot:', error);
      throw error;
    }
  }

  /**
   * 分享截图（使用Web Share API）
   * @param shareOptions 分享选项
   * @param screenshotOptions 截图选项
   * @returns Promise<void>
   */
  async share(
    shareOptions: ShareOptions = {},
    screenshotOptions: ScreenshotOptions = {}
  ): Promise<void> {
    // 检查Web Share API是否可用
    if (!this.isShareSupported()) {
      throw new Error('Web Share API is not supported in this browser');
    }

    const {
      title = '新年烟花游戏',
      text = '看看我燃放的烟花！',
      url,
    } = shareOptions;

    const {
      format = 'image/png',
      quality = 0.92,
      filename = `fireworks-${Date.now()}.${this.getFileExtension(format)}`,
    } = screenshotOptions;

    try {
      const blob = await this.captureAsBlob({ format, quality });
      const file = new File([blob], filename, { type: format });

      const shareData: ShareData = {
        title,
        text,
        files: [file],
      };

      // 添加URL（如果提供）
      if (url) {
        shareData.url = url;
      }

      // 检查是否可以分享文件
      if (navigator.canShare && !navigator.canShare(shareData)) {
        throw new Error('Cannot share files in this browser');
      }

      await navigator.share(shareData);
    } catch (error) {
      // 用户取消分享不算错误
      if ((error as Error).name === 'AbortError') {
        console.log('Share cancelled by user');
        return;
      }

      console.error('Failed to share screenshot:', error);
      throw error;
    }
  }

  /**
   * 检查Web Share API是否支持
   * @returns 是否支持
   */
  isShareSupported(): boolean {
    return 'share' in navigator && 'canShare' in navigator;
  }

  /**
   * 检查是否可以分享文件
   * @returns 是否可以分享文件
   */
  canShareFiles(): boolean {
    if (!this.isShareSupported()) {
      return false;
    }

    // 测试是否可以分享文件
    try {
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      return navigator.canShare?.({ files: [testFile] }) ?? false;
    } catch {
      return false;
    }
  }

  /**
   * 复制截图到剪贴板
   * @param options 截图选项
   * @returns Promise<void>
   */
  async copyToClipboard(options: ScreenshotOptions = {}): Promise<void> {
    // 检查Clipboard API是否可用
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API is not supported in this browser');
    }

    const {
      format = 'image/png',
      quality = 0.92,
    } = options;

    try {
      const blob = await this.captureAsBlob({ format, quality });
      const clipboardItem = new ClipboardItem({ [format]: blob });

      await navigator.clipboard.write([clipboardItem]);
    } catch (error) {
      console.error('Failed to copy screenshot to clipboard:', error);
      throw error;
    }
  }

  /**
   * 获取文件扩展名
   * @param format 图片格式
   * @returns 文件扩展名
   */
  private getFileExtension(format: string): string {
    switch (format) {
      case 'image/png':
        return 'png';
      case 'image/jpeg':
        return 'jpg';
      case 'image/webp':
        return 'webp';
      default:
        return 'png';
    }
  }

  /**
   * 更新Canvas引用
   * @param canvas 新的Canvas元素
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  /**
   * 获取当前Canvas
   * @returns Canvas元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

/**
 * 创建截图分享器实例
 * @param canvas Canvas元素
 * @returns ScreenshotSharer实例
 */
export function createScreenshotSharer(canvas: HTMLCanvasElement): ScreenshotSharer {
  return new ScreenshotSharer(canvas);
}
