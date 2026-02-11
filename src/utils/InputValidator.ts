/**
 * 输入验证器
 * Feature: new-year-fireworks-game
 * 
 * 验证用户输入（昵称、房间码、坐标等）
 */

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误消息 */
  error?: string;
}

/**
 * 输入验证器类
 */
export class InputValidator {
  /**
   * 验证昵称
   * 需求：9.1, 9.2
   * 
   * @param nickname - 昵称字符串
   * @returns 验证结果
   */
  validateNickname(nickname: string): ValidationResult {
    // 验证长度（1-8个字符）
    if (nickname.length < 1 || nickname.length > 8) {
      return { 
        valid: false, 
        error: '昵称长度必须在1-8个字符之间' 
      };
    }
    
    // 验证字符（仅中文、英文字母和数字）
    const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
    if (!validPattern.test(nickname)) {
      return { 
        valid: false, 
        error: '昵称只能包含中文、英文和数字' 
      };
    }
    
    return { valid: true };
  }
  
  /**
   * 验证房间码
   * 需求：9.3
   * 
   * @param code - 房间码字符串
   * @returns 验证结果
   */
  validateRoomCode(code: string): ValidationResult {
    // 验证长度（必须是4位）
    if (code.length !== 4) {
      return { 
        valid: false, 
        error: '房间码必须是4位数字' 
      };
    }
    
    // 验证格式（仅数字）
    const validPattern = /^\d{4}$/;
    if (!validPattern.test(code)) {
      return { 
        valid: false, 
        error: '房间码只能包含数字' 
      };
    }
    
    return { valid: true };
  }
  
  /**
   * 验证坐标
   * 
   * @param x - X坐标
   * @param y - Y坐标
   * @param maxX - 最大X坐标
   * @param maxY - 最大Y坐标
   * @returns 验证结果
   */
  validateCoordinates(
    x: number, 
    y: number, 
    maxX: number, 
    maxY: number
  ): ValidationResult {
    if (x < 0 || x > maxX || y < 0 || y > maxY) {
      return { 
        valid: false, 
        error: '坐标超出范围' 
      };
    }
    
    return { valid: true };
  }
}
