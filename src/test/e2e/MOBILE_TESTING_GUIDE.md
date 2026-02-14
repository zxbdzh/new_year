# 移动端测试指南

## 概述

本指南说明如何在移动设备和移动浏览器上测试新年烟花游戏。

## 测试设备要求

### iOS设备
- **iPhone SE (第2代或更新)**: 小屏幕测试
- **iPhone 12/13/14**: 标准屏幕测试
- **iPad (第8代或更新)**: 平板测试
- **iOS版本**: 14.0或更高

### Android设备
- **小屏幕**: 360x640 (如Samsung Galaxy S8)
- **标准屏幕**: 390x844 (如Pixel 5)
- **平板**: 768x1024 (如Samsung Galaxy Tab)
- **Android版本**: 8.0或更高

## 浏览器兼容性

### iOS
- Safari 14+（主要测试浏览器）
- Chrome for iOS（次要）

### Android
- Chrome Mobile（主要测试浏览器）
- Firefox Mobile（次要）
- Samsung Internet（可选）

## 测试方法

### 方法1：真实设备测试（推荐）

1. **连接设备到开发机器**
   ```bash
   # 启动开发服务器
   pnpm dev
   
   # 获取本地IP地址
   ipconfig  # Windows
   ifconfig  # macOS/Linux
   ```

2. **在移动设备上访问**
   - 确保设备和开发机器在同一网络
   - 在移动浏览器中访问：`http://<your-ip>:5173`

3. **执行测试检查清单**（见下文）

### 方法2：Chrome DevTools设备模拟

1. **启动Chrome DevTools**
   - 打开Chrome浏览器
   - 按F12打开开发者工具
   - 点击设备工具栏图标（Ctrl+Shift+M）

2. **选择设备**
   - iPhone SE
   - iPhone 12 Pro
   - iPad
   - Pixel 5
   - 或自定义尺寸

3. **执行测试**

### 方法3：使用Chrome DevTools MCP（自动化）

使用Chrome DevTools MCP工具进行自动化测试：

```typescript
// 设置移动设备视口
await mcp_chrome_devtools_emulate({
  viewport: {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  }
});

// 导航到游戏
await mcp_chrome_devtools_navigate_page({
  url: 'http://localhost:5173'
});

// 执行测试操作...
```

## 测试检查清单

### 1. 触摸交互测试

- [ ] **单点触摸**
  - 触摸Canvas任意位置
  - 验证烟花在触摸位置生成
  - 验证触摸反馈涟漪效果显示

- [ ] **多点触摸**
  - 同时用多个手指触摸不同位置
  - 验证多个烟花同时生成
  - 验证每个触摸点都有反馈

- [ ] **触摸防抖**
  - 快速连续触摸同一位置
  - 验证烟花生成频率受限（约100ms间隔）

- [ ] **连击触发**
  - 3秒内快速触摸5次
  - 验证连击效果触发
  - 验证连击倍数显示

- [ ] **触摸精度**
  - 触摸小按钮（设置、静音等）
  - 验证按钮响应准确
  - 验证按钮尺寸符合WCAG标准（44x44px）

### 2. 性能测试

- [ ] **帧率测试**
  - 生成多个烟花
  - 使用浏览器性能工具监控FPS
  - 验证FPS保持在30以上

- [ ] **内存使用**
  - 长时间游玩（5-10分钟）
  - 监控内存使用
  - 验证无明显内存泄漏

- [ ] **电池消耗**
  - 游玩10分钟
  - 检查电池消耗是否合理
  - 验证设备不过热

- [ ] **加载时间**
  - 测量首屏加载时间
  - 验证在3秒内完成加载

### 3. 响应式布局测试

- [ ] **竖屏模式**
  - 所有UI元素可见
  - 倒计时显示正常
  - 按钮位置合理
  - Canvas填满屏幕

- [ ] **横屏模式**
  - 所有UI元素可见
  - 布局自动调整
  - 控制按钮位置合理

- [ ] **屏幕旋转**
  - 从竖屏旋转到横屏
  - 验证布局平滑过渡
  - 验证Canvas尺寸更新
  - 验证游戏状态保持

- [ ] **不同屏幕尺寸**
  - 小屏幕（320px宽）
  - 标准屏幕（375-414px宽）
  - 大屏幕（平板，768px+宽）

### 4. 移动端浏览器特性

- [ ] **禁用双击缩放**
  - 快速双击Canvas
  - 验证页面不缩放

- [ ] **禁用长按菜单**
  - 长按Canvas
  - 验证不显示上下文菜单

- [ ] **禁止文本选择**
  - 尝试拖拽选择文本
  - 验证无法选择

- [ ] **音频自动播放**
  - 启动游戏
  - 验证音频在用户交互后播放
  - 验证无自动播放错误

- [ ] **全屏模式**
  - 进入全屏（如果支持）
  - 验证UI正确显示
  - 验证退出全屏正常

### 5. 网络条件测试

- [ ] **3G网络**
  - 使用Chrome DevTools限制网络速度
  - 验证游戏可正常加载
  - 验证多人模式同步正常

- [ ] **4G网络**
  - 验证加载速度快
  - 验证多人模式延迟低

- [ ] **WiFi网络**
  - 验证最佳性能

- [ ] **离线模式**
  - 断开网络
  - 验证单人模式仍可游玩
  - 验证显示离线提示

### 6. 完整流程测试

- [ ] **单人游戏流程**
  1. 启动游戏
  2. 选择单人模式
  3. 触摸生成烟花
  4. 触发连击效果
  5. 打开设置调整配置
  6. 退出游戏
  7. 重新进入验证数据保存

- [ ] **多人游戏流程**
  1. 启动游戏
  2. 选择多人模式
  3. 输入昵称
  4. 加入公共房间
  5. 触摸生成烟花
  6. 查看排行榜
  7. 退出房间

### 7. 特殊场景测试

- [ ] **刘海屏设备**
  - iPhone X及更新机型
  - 验证内容不被刘海遮挡
  - 验证使用safe-area-inset

- [ ] **折叠屏设备**
  - 展开和折叠状态
  - 验证布局适配

- [ ] **高刷新率屏幕**
  - 90Hz/120Hz屏幕
  - 验证动画流畅

## 常见问题排查

### 问题1：触摸无响应

**可能原因：**
- 触摸事件未正确绑定
- CSS `touch-action` 设置不当
- 事件被其他元素拦截

**排查步骤：**
1. 检查浏览器控制台是否有错误
2. 验证Canvas元素的`onTouchStart`事件
3. 检查CSS `touch-action`属性

### 问题2：性能低下

**可能原因：**
- 未使用移动端优化配置
- 粒子数量过多
- Canvas分辨率过高

**排查步骤：**
1. 检查性能配置是否为"low"
2. 验证粒子数量限制
3. 检查Canvas实际分辨率

### 问题3：布局错乱

**可能原因：**
- 响应式CSS未生效
- 视口meta标签缺失
- 安全区域未处理

**排查步骤：**
1. 检查`<meta name="viewport">`标签
2. 验证CSS媒体查询
3. 检查safe-area-inset使用

### 问题4：音频不播放

**可能原因：**
- 浏览器自动播放限制
- AudioContext未恢复
- 音频文件加载失败

**排查步骤：**
1. 检查是否在用户交互后播放
2. 验证AudioContext.resume()调用
3. 检查浏览器控制台错误

## 性能基准

### 最低要求
- **FPS**: ≥30
- **首屏加载**: ≤3秒
- **触摸响应**: ≤100ms
- **内存使用**: ≤100MB

### 推荐目标
- **FPS**: ≥45
- **首屏加载**: ≤2秒
- **触摸响应**: ≤50ms
- **内存使用**: ≤80MB

## 测试报告模板

```markdown
# 移动端测试报告

## 测试信息
- **测试日期**: YYYY-MM-DD
- **测试人员**: [姓名]
- **测试设备**: [设备型号]
- **操作系统**: [iOS/Android版本]
- **浏览器**: [浏览器版本]

## 测试结果

### 触摸交互
- [ ] 通过 / [ ] 失败 - 单点触摸
- [ ] 通过 / [ ] 失败 - 多点触摸
- [ ] 通过 / [ ] 失败 - 触摸防抖
- [ ] 通过 / [ ] 失败 - 连击触发

### 性能
- 平均FPS: [数值]
- 首屏加载时间: [数值]秒
- 内存使用: [数值]MB

### 响应式布局
- [ ] 通过 / [ ] 失败 - 竖屏模式
- [ ] 通过 / [ ] 失败 - 横屏模式
- [ ] 通过 / [ ] 失败 - 屏幕旋转

### 发现的问题
1. [问题描述]
2. [问题描述]

### 建议
1. [改进建议]
2. [改进建议]
```

## 自动化测试脚本

参考`src/test/e2e/mobile-touch.e2e.test.ts`文件，使用Chrome DevTools MCP工具执行自动化测试。

## 持续集成

在CI/CD流程中集成移动端测试：

```yaml
# .github/workflows/mobile-test.yml
name: Mobile E2E Tests

on: [push, pull_request]

jobs:
  mobile-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: pnpm install
      - name: Run mobile E2E tests
        run: pnpm test:e2e:mobile
```

## 参考资源

- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [iOS Safari Web Inspector](https://webkit.org/web-inspector/)
- [Android Chrome Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
