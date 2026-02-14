# E2E测试实现指南

## 概述

本目录包含4个端到端（E2E）集成测试套件，用于验证新年烟花游戏的完整用户流程。这些测试使用Chrome DevTools MCP工具进行浏览器自动化。

## 当前状态

✅ **测试文档已完成** - 所有测试用例都已文档化，包含详细的MCP命令说明
⚠️ **需要MCP工具** - 实际运行这些测试需要Chrome DevTools MCP工具

## 测试套件

### 1. 单人游戏流程 (single-player-flow.e2e.test.ts)
- **测试数量**: 11个测试用例
- **覆盖需求**: 1.1-1.6, 2.1-2.6, 3.1-3.7, 4.1-4.5
- **测试内容**:
  - 启动界面显示和交互
  - 模式选择导航
  - 单人游戏界面
  - 倒计时功能
  - 烟花生成和交互
  - 连击系统
  - 烟花收藏画廊
  - 数据持久化
  - 游戏结束流程

### 2. 多人游戏流程 (multiplayer-flow.e2e.test.ts)
- **测试数量**: 13个测试用例
- **覆盖需求**: 5.1-5.9, 11.1-11.5
- **测试内容**:
  - 多人模式导航
  - 昵称输入和验证
  - 房间选择和加入
  - 烟花同步（多客户端）
  - 玩家通知
  - 快速祝福语
  - 网络状态指示
  - 房间容量限制
  - 网络断线和重连
  - 优雅降级

### 3. 特殊事件 (special-events.e2e.test.ts)
- **测试数量**: 7个测试用例
- **覆盖需求**: 7.1-7.4, 8.1-8.5
- **测试内容**:
  - 整点烟花雨
  - 10分钟倒计时特效
  - 少于1小时特殊效果
  - 新年祝福动画
  - 截图分享功能
  - 烟花收藏画廊
  - 游戏结束界面

### 4. 设置功能 (settings.e2e.test.ts)
- **测试数量**: 13个测试用例
- **覆盖需求**: 2.5, 6.3-6.6
- **测试内容**:
  - 设置界面打开
  - 音乐音量控制
  - 音效音量控制
  - 静音切换
  - 主题切换
  - 倒计时皮肤切换
  - 性能配置切换
  - 手动时间校准
  - 设置保存和持久化
  - 设置取消
  - 实时预览

## 测试结构

每个测试用例包含：

1. **测试描述** - 说明测试目的
2. **MCP命令注释** - 详细的MCP工具使用说明
3. **验证点** - 需要验证的内容列表
4. **需求追溯** - 覆盖的需求编号
5. **占位符断言** - `expect(true).toBe(true)` 和 `it.skip()`

## 如何实现这些测试

### 步骤1: 安装Chrome DevTools MCP

确保已安装并配置Chrome DevTools MCP工具。参考MCP文档进行安装。

### 步骤2: 启动必要的服务

```cmd
# 启动开发服务器
pnpm dev

# 启动WebSocket服务器（仅多人游戏测试需要）
cd server
pnpm dev
```

### 步骤3: 实现测试

将测试文件中的注释转换为实际的MCP工具调用。例如：

```typescript
// 从这个：
it.skip('should display launch screen', () => {
  /**
   * 需要使用的MCP工具：
   * 1. mcp_chrome_devtools_navigate_page({ url: baseUrl })
   * 2. mcp_chrome_devtools_take_snapshot()
   */
  console.log('📋 测试说明：验证启动界面');
  expect(true).toBe(true);
});

// 转换为这个：
it('should display launch screen', async () => {
  // 导航到页面
  await mcp_chrome_devtools_navigate_page({ url: baseUrl });
  
  // 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 获取页面快照
  const snapshot = await mcp_chrome_devtools_take_snapshot();
  
  // 验证内容
  expect(snapshot).toContain('新年烟花游戏');
  expect(snapshot).toContain('点击开始');
});
```

### 步骤4: 运行测试

```cmd
# 运行所有E2E测试
pnpm test:e2e --run

# 运行特定测试文件
pnpm test src/test/e2e/single-player-flow.e2e.test.ts --run
```

## MCP工具快速参考

### 导航和页面管理
```typescript
// 导航到URL
mcp_chrome_devtools_navigate_page({ url: 'http://localhost:5173' })

// 创建新页面
mcp_chrome_devtools_new_page({ url: 'http://localhost:5173' })

// 选择页面
mcp_chrome_devtools_select_page({ pageId: 1 })

// 关闭页面
mcp_chrome_devtools_close_page({ pageId: 1 })
```

### 交互
```typescript
// 点击元素
mcp_chrome_devtools_click({ uid: 'element-id' })

// 填写表单
mcp_chrome_devtools_fill({ uid: 'input-id', value: 'text' })

// 按键
mcp_chrome_devtools_press_key({ key: 'Enter' })
```

### 验证和调试
```typescript
// 获取页面快照
mcp_chrome_devtools_take_snapshot()

// 截图
mcp_chrome_devtools_take_screenshot({ filePath: './screenshot.png' })

// 执行JavaScript
mcp_chrome_devtools_evaluate_script({ 
  function: '() => { return document.title; }' 
})
```

### 网络和性能
```typescript
// 模拟网络条件
mcp_chrome_devtools_emulate({ networkConditions: 'Slow 3G' })

// 等待元素
mcp_chrome_devtools_wait_for({ text: 'Loading complete' })
```

## 测试最佳实践

### 1. 等待策略
```typescript
// 等待页面加载
await new Promise(resolve => setTimeout(resolve, 1000));

// 等待特定文本出现
await mcp_chrome_devtools_wait_for({ text: '加载完成' });
```

### 2. 错误处理
```typescript
try {
  await mcp_chrome_devtools_click({ uid: 'button' });
} catch (error) {
  console.error('点击失败:', error);
  // 截图用于调试
  await mcp_chrome_devtools_take_screenshot({ 
    filePath: './error-screenshot.png' 
  });
  throw error;
}
```

### 3. 清理
```typescript
afterAll(async () => {
  // 关闭所有打开的页面
  if (pageId) {
    await mcp_chrome_devtools_close_page({ pageId });
  }
});
```

## 调试技巧

### 1. 使用快照调试
```typescript
const snapshot = await mcp_chrome_devtools_take_snapshot();
console.log('页面内容:', snapshot);
```

### 2. 使用截图调试
```typescript
await mcp_chrome_devtools_take_screenshot({
  filePath: `./debug-${Date.now()}.png`
});
```

### 3. 检查元素状态
```typescript
const result = await mcp_chrome_devtools_evaluate_script({
  function: '() => { return document.querySelector("#element").textContent; }'
});
console.log('元素内容:', result);
```

## 常见问题

### Q: 测试超时怎么办？
A: 增加等待时间或使用 `mcp_chrome_devtools_wait_for` 等待特定条件。

### Q: 找不到元素怎么办？
A: 使用 `mcp_chrome_devtools_take_snapshot` 查看页面结构，确认元素的uid。

### Q: 网络请求失败怎么办？
A: 检查开发服务器和WebSocket服务器是否正在运行。

### Q: 测试不稳定怎么办？
A: 增加等待时间，使用更可靠的等待策略，避免硬编码的延迟。

## 下一步

1. ✅ 测试文档已完成
2. ⏳ 安装和配置Chrome DevTools MCP
3. ⏳ 实现测试用例（将注释转换为实际调用）
4. ⏳ 运行测试并修复问题
5. ⏳ 集成到CI/CD管道

## 相关文档

- [E2E测试README](./README.md) - 详细的测试说明
- [测试指南](../../.kiro/steering/testing.md) - 项目测试规范
- [开发规范](../../.kiro/steering/development.md) - 代码规范

## 联系和支持

如有问题，请参考：
- Chrome DevTools MCP文档
- 项目README.md
- 测试指南文档
