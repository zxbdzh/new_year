/**
 * 音频自动播放处理器
 * Feature: new-year-fireworks-game
 * 
 * 处理浏览器自动播放限制，在用户首次交互时解锁AudioContext
 * 需求：1.4
 */

/**
 * 音频自动播放处理器类
 */
export class AudioAutoplayHandler {
  private audioContext: AudioContext;
  private unlocked: boolean = false;
  private unlockCallbacks: Set<() => void> = new Set();

  /**
   * 构造函数
   * 
   * @param audioContext - AudioContext实例
   */
  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * 解锁音频播放
   * 在用户首次交互时调用
   * 需求：1.4
   * 
   * @returns Promise
   */
  async unlock(): Promise<void> {
    if (this.unlocked) {
      return;
    }

    // 创建解锁函数
    const unlockHandler = async () => {
      try {
        // 恢复AudioContext
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        // 创建一个静音的音频节点来解锁
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        gainNode.gain.value = 0; // 静音
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(0);
        oscillator.stop(this.audioContext.currentTime + 0.01);

        // 标记为已解锁
        this.unlocked = true;

        // 触发所有回调
        this.unlockCallbacks.forEach(callback => callback());
        this.unlockCallbacks.clear();

        // 移除事件监听器
        this.removeEventListeners(unlockHandler);
      } catch (error) {
        console.error('Failed to unlock audio:', error);
      }
    };

    // 添加事件监听器
    this.addEventListeners(unlockHandler);
  }

  /**
   * 添加事件监听器
   * 
   * @param handler - 事件处理函数
   */
  private addEventListeners(handler: () => void): void {
    // 监听多种用户交互事件
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
    document.addEventListener('touchend', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
  }

  /**
   * 移除事件监听器
   * 
   * @param handler - 事件处理函数
   */
  private removeEventListeners(handler: () => void): void {
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);
    document.removeEventListener('touchend', handler);
    document.removeEventListener('keydown', handler);
  }

  /**
   * 检查是否已解锁
   * 
   * @returns 是否已解锁
   */
  isUnlocked(): boolean {
    return this.unlocked;
  }

  /**
   * 注册解锁回调
   * 当音频解锁时调用
   * 
   * @param callback - 回调函数
   */
  onUnlock(callback: () => void): void {
    if (this.unlocked) {
      // 如果已解锁，立即调用
      callback();
    } else {
      // 否则添加到回调列表
      this.unlockCallbacks.add(callback);
    }
  }

  /**
   * 获取AudioContext状态
   * 
   * @returns AudioContext状态
   */
  getContextState(): AudioContextState {
    return this.audioContext.state;
  }
}
