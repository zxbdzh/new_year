# WebSocket服务器安装指南

## 快速开始

### 1. 安装依赖

```bash
cd server
pnpm install
```

如果没有安装pnpm，可以先安装：

```bash
npm install -g pnpm
```

或使用npm：

```bash
cd server
npm install
```

### 2. 配置环境变量（可选）

```bash
cp .env.example .env
```

编辑 `.env` 文件根据需要修改配置。

### 3. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3001` 启动。

### 4. 验证服务器运行

打开浏览器访问：

```
http://localhost:3001/health
```

应该看到类似以下的响应：

```json
{
  "status": "ok",
  "timestamp": 1234567890123,
  "uptime": 12.345
}
```

## 测试WebSocket连接

可以使用浏览器控制台测试WebSocket连接：

```javascript
// 在浏览器控制台中运行
const socket = io('http://localhost:3001');

socket.on('connected', (data) => {
  console.log('已连接:', data);
});

socket.on('pong', (data) => {
  console.log('收到pong:', data);
});

// 发送心跳
socket.emit('ping');
```

## 常见问题

### 端口已被占用

如果端口3001已被占用，可以修改 `.env` 文件中的 `PORT` 值：

```
PORT=3002
```

### CORS错误

如果前端运行在不同的端口，需要修改 `.env` 文件中的 `CORS_ORIGIN`：

```
CORS_ORIGIN=http://localhost:5173
```

### 依赖安装失败

尝试清理缓存后重新安装：

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 下一步

服务器已完成以下功能：

✅ 基础服务器搭建（任务21.1）
✅ 房间管理系统（任务21.2）
✅ 玩家会话管理（任务21.3）
✅ 消息广播系统（任务21.4）

接下来需要实现客户端网络同步器（任务22），请参考 `README.md` 了解服务器API详情。
