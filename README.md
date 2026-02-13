# 新年烟花游戏 (New Year Fireworks Game)

一款基于Web的节日主题互动游戏，让用户在虚拟环境中体验燃放烟花的乐趣，同时倒计时迎接农历新年。

## 核心功能

- 🎆 **交互式烟花系统** - 点击屏幕燃放5种以上烟花类型
- ⏰ **3D倒计时显示** - 实时显示距离农历新年的剩余时间
- 👤 **单人模式** - 收集烟花样式、追踪统计、解锁成就
- 👥 **多人模式** - 支持公共/私人房间，实时同步烟花操作
- 🔥 **连击系统** - 快速连续点击触发增强效果
- ✨ **特殊事件** - 整点烟花雨、新年祝福动画
- ⚙️ **设置系统** - 音频、主题、性能、倒计时校准
- 🔄 **流程管理** - 完整的游戏生命周期（启动→选择→游戏→结束）
- 💾 **数据持久化** - 自动保存游戏进度和统计数据
- 🎵 **音频控制** - 背景音乐、音效、静音切换

## 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 8
- **状态管理**: Redux Toolkit
- **渲染**: Canvas 2D API / WebGL
- **实时通信**: Socket.io Client
- **音频**: Web Audio API
- **存储**: IndexedDB
- **测试**: Vitest + fast-check (属性测试)

### 后端
- **运行时**: Node.js 18+
- **框架**: Express 4.18.2
- **WebSocket**: Socket.io 4.8.3
- **语言**: TypeScript 5.3.3
- **开发工具**: tsx 4.7.0

## 快速开始

### 环境变量

创建 `.env` 文件配置服务器地址（可选）：

```env
VITE_SERVER_URL=http://localhost:3001
```

如未配置，默认使用 `http://localhost:3001`。

### 前端开发

```cmd
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 后端开发

```cmd
# 进入server目录
cd server

# 安装依赖
pnpm install

# 启动WebSocket服务器
pnpm dev
```

详细的服务器安装和配置说明请参考 [server/INSTALL.md](server/INSTALL.md)。

### 构建

```cmd
pnpm run build
pnpm run preview
```

### 测试

```cmd
pnpm test              # 运行所有测试
pnpm test --run        # 单次运行（不使用watch模式）
pnpm test:unit         # 运行单元测试
pnpm test:pbt          # 运行属性测试
pnpm test:ui           # 测试UI界面
```

#### 属性测试 (Property-Based Testing)

项目使用 [fast-check](https://github.com/dubzzz/fast-check) 进行属性测试，验证系统的正确性属性。属性测试文件使用 `.pbt.test.ts` 后缀。

**网络同步属性测试** (`src/services/NetworkSynchronizer.pbt.test.ts`):
- **属性 15**: 烟花动作广播 - 验证烟花动作正确广播到房间内所有其他玩家
- **属性 16**: 在线玩家数量一致性 - 验证显示的玩家数量与实际一致
- **属性 17**: 排行榜排序正确性 - 验证TOP3玩家按烟花数量降序排列
- **属性 27**: 房间容量限制 - 验证房间满员时拒绝新玩家加入

每个属性测试运行100次迭代，使用随机生成的测试数据验证系统不变量。

### 代码质量

```cmd
pnpm run lint          # 代码检查
pnpm run format        # 代码格式化
```

## 应用架构

### 游戏流程

应用实现了完整的游戏生命周期管理：

```
启动界面 (LaunchScreen)
    ↓
模式选择 (ModeSelection)
    ↓
┌─────────────┬─────────────┐
│  单人模式    │  多人模式    │
│ SinglePlayer │ Multiplayer │
└─────────────┴─────────────┘
    ↓
游戏结束界面 (GameEndScreen)
    ↓
返回模式选择 / 退出
```

### 核心服务

App.tsx 在应用级别初始化和管理以下核心服务：

- **AudioController** - 音频管理和播放控制
- **NetworkSynchronizer** - 多人模式实时通信
- **StorageService** - 本地数据持久化

这些服务通过 `useRef` 在组件生命周期内保持单例，并传递给子组件使用。

### 状态管理

- **全局状态** (Redux): 游戏模式、音频配置、统计数据
- **本地状态** (useState): 过渡动画、确认对话框
- **服务引用** (useRef): 音频、网络、存储服务实例

### 项目结构

```
src/
├── components/        # React组件
│   ├── LaunchScreen.tsx       # 启动界面
│   ├── ModeSelection.tsx      # 模式选择
│   ├── SinglePlayerGame.tsx   # 单人游戏
│   ├── MultiplayerGame.tsx    # 多人游戏
│   ├── GameEndScreen.tsx      # 结束界面
│   ├── CountdownDisplay.tsx   # 倒计时显示
│   ├── SettingsScreen.tsx     # 设置界面
│   └── ...
├── engines/           # 游戏引擎（烟花、倒计时）
├── services/          # 服务层（网络、音频、存储）
├── store/             # Redux状态管理
├── types/             # TypeScript类型定义
├── utils/             # 工具函数
└── App.tsx            # 主应用组件（流程控制）
```

## 文档

- 📋 [需求文档](.kiro/specs/new-year-fireworks-game/requirements.md)
- 🎨 [设计文档](.kiro/specs/new-year-fireworks-game/design.md)
- ✅ [任务列表](.kiro/specs/new-year-fireworks-game/tasks.md)
- 📊 [项目状态](PROJECT_STATUS.md)

## 性能要求

- 目标帧率: ≥30 FPS (低配) / ≥60 FPS (高配)
- 网络延迟: ≤1秒 (多人同步)
- 首屏加载: ≤3秒

## 兼容性

- 浏览器: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 移动设备: iOS 14+, Android 8+
- 屏幕尺寸: 320px - 4K
