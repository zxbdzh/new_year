---
inclusion: auto
---

# 项目开发规则

本文档定义了新年烟花游戏项目的开发规范和约束条件。

## 语言规范

- **对话语言**：所有对话、注释、提交信息必须使用中文
- **代码注释**：所有函数必须包含中文注释，说明功能、参数和返回值

## 系统环境

- **操作系统**：Windows
- **终端**：cmd/PowerShell
- **命令分隔符**：使用 `&` (cmd) 或 `;` (PowerShell)，不使用 `&&`

## 包管理器优先级

### 前端项目
1. **首选**：bun
2. **次选**：pnpm
3. **最后**：npm

### Python项目
- **使用**：uv

## 开发流程规范

### 命令执行规则
- **开发服务器命令**（如 `npm run dev`、`bun dev`）：由用户手动执行
- **构建和测试命令**：可以由 AI 执行
- **长时间运行的命令**：提示用户手动执行

### Git 提交规范
- **提交频率**：每个任务完成后必须提交到 git
- **提交信息**：使用中文，格式清晰
- **提交信息格式**：
  ```
  feat: 实现烟花引擎核心功能
  
  - 创建 FireworkType 和 Particle 接口
  - 实现 5 种烟花类型
  - 添加粒子物理系统
  ```

## 代码规范

### 函数注释示例

```typescript
/**
 * 在指定位置发射烟花
 * @param x - 烟花发射的 x 坐标
 * @param y - 烟花发射的 y 坐标
 * @param typeId - 烟花类型 ID（可选，不指定则随机选择）
 * @returns 返回生成的烟花实例 ID
 */
launchFirework(x: number, y: number, typeId?: string): string {
  // 实现代码
}
```

```python
def calculate_lunar_date(year: int, month: int, day: int) -> datetime:
    """
    计算指定农历日期对应的公历日期
    
    参数:
        year: 农历年份
        month: 农历月份
        day: 农历日期
    
    返回:
        对应的公历日期对象
    """
    # 实现代码
```

## 项目特定规范

### 技术栈
- **前端框架**：React + TypeScript
- **构建工具**：Vite
- **状态管理**：Redux Toolkit
- **实时通信**：Socket.io
- **测试框架**：Vitest + fast-check

### 文件组织
```
src/
├── components/     # React 组件
├── services/       # 服务层（网络、音频、存储）
├── engines/        # 游戏引擎（烟花、倒计时）
├── utils/          # 工具函数
├── types/          # TypeScript 类型定义
├── store/          # Redux store 和 slices
└── assets/         # 静态资源
```

### 命名规范
- **组件文件**：PascalCase（如 `FireworkEngine.tsx`）
- **工具函数**：camelCase（如 `validateNickname.ts`）
- **类型文件**：PascalCase（如 `FireworkTypes.ts`）
- **常量**：UPPER_SNAKE_CASE（如 `MAX_PLAYERS`）

## 测试规范

### 属性测试
- 使用 `fast-check` 库
- 每个属性测试至少运行 100 次迭代
- 测试注释必须引用设计文档中的属性编号

```typescript
// Feature: new-year-fireworks-game, Property 6: 烟花类型有效性
test('烟花类型有效性', () => {
  fc.assert(
    fc.property(coordinateArbitrary, (coord) => {
      const firework = engine.launchFirework(coord.x, coord.y);
      const validTypes = ['peony', 'meteor', 'heart', 'fortune', 'redEnvelope'];
      expect(validTypes).toContain(firework.type.pattern);
    }),
    { numRuns: 100 }
  );
});
```

## 性能要求

- **目标帧率**：≥30 FPS（低配设备）、≥60 FPS（高配设备）
- **网络延迟**：多人同步延迟 ≤1 秒
- **首屏加载**：≤3 秒

## 兼容性要求

- **浏览器**：Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **移动设备**：iOS 14+、Android 8+
- **屏幕尺寸**：320px - 4K

## 注意事项

1. **音频自动播放**：需要用户交互后才能播放，实现 AudioAutoplayHandler
2. **Canvas 性能**：使用对象池减少 GC 压力
3. **WebSocket 重连**：最多尝试 3 次，每次间隔 5 秒
4. **本地存储**：使用 IndexedDB，处理配额超限错误
5. **农历计算**：使用成熟的库（lunar-javascript），不要自己实现

## 开发工作流

1. 阅读任务描述和相关需求
2. 实现功能代码（包含函数注释）
3. 编写测试（单元测试 + 属性测试）
4. 运行测试确保通过
5. 提交到 git（中文提交信息）
6. 继续下一个任务

## 遇到问题时

- 如果测试失败超过 2 次，向用户说明情况并请求指导
- 如果需求不清晰，向用户确认
- 如果技术选型有疑问，与用户讨论
