# 🔄 流式传输演示项目

一个基于 **Server-Sent Events (SSE)** 的实时数据推送演示项目，展示了如何使用 Express.js 和原生 JavaScript 实现服务器向客户端的实时数据流传输。

## ✨ 功能特性

### 🚀 核心功能

- **实时数据推送**: 使用 SSE 技术实现服务器向客户端的实时数据流
- **自动重连机制**: 连接断开时自动重试，最多重试 5 次
- **连接状态监控**: 实时显示连接状态和连接时间
- **消息广播**: 支持向所有连接的客户端广播消息
- **健康检查**: 提供服务器状态检查接口

### 🎨 用户界面

- **现代化设计**: 响应式布局，支持移动端访问
- **实时状态指示**: 连接状态的可视化指示器
- **消息分类显示**: 不同类型消息的差异化展示
- **统计信息**: 显示消息数量、连接时间等统计信息
- **通知系统**: 操作结果的实时反馈

### 🔧 技术特性

- **错误处理**: 完善的错误处理和异常恢复机制
- **CORS 支持**: 支持跨域访问
- **连接池管理**: 高效的客户端连接管理
- **JSON 数据格式**: 标准化的数据交换格式

## 📋 目录结构

```
streamTransmission/
├── index.js          # 后端服务器代码
├── index.html        # 前端页面
├── package.json      # 项目配置
└── README.md         # 项目文档
```

## 🛠️ 安装和使用

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 安装步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd streamTransmission
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **启动服务器**

   ```bash
   # 生产环境
   npm start

   # 开发环境（自动重启）
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 `http://localhost:3000`

## 📚 API 文档

### 基础接口

#### GET `/`

- **描述**: 主页，返回前端页面
- **响应**: HTML 页面

#### GET `/sse`

- **描述**: SSE 连接端点
- **响应头**:
  ```
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive
  Access-Control-Allow-Origin: *
  ```
- **数据格式**:
  ```json
  {
    "type": "time|connection|broadcast",
    "message": "消息内容",
    "timestamp": 1234567890
  }
  ```

#### POST `/broadcast`

- **描述**: 广播消息接口
- **请求体**:
  ```json
  {
    "message": "要广播的消息"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "clientsCount": 5
  }
  ```

#### GET `/health`

- **描述**: 健康检查接口
- **响应**:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "activeConnections": 3
  }
  ```

## 🔧 技术实现

### 后端实现 (index.js)

#### 核心组件

1. **Express 服务器**: 使用 Express.js 框架
2. **SSE 连接管理**: 使用 Set 数据结构管理客户端连接
3. **定时器管理**: 使用 setInterval 定期推送数据
4. **错误处理**: 完善的异常捕获和处理机制

#### 关键代码片段

```javascript
// SSE 连接管理
const clients = new Set();

app.get("/sse", (req, res) => {
  // 设置 SSE 响应头
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // 添加到连接池
  clients.add(res);

  // 定期推送数据
  const intervalId = setInterval(() => {
    const data = {
      type: "time",
      message: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 1000);
});
```

### 前端实现 (index.html)

#### 核心组件

1. **SSEManager 类**: 封装 SSE 连接管理逻辑
2. **状态管理**: 连接状态的可视化展示
3. **消息处理**: 不同类型消息的差异化处理
4. **重连机制**: 自动重连和错误恢复

#### 关键代码片段

```javascript
class SSEManager {
  constructor() {
    this.source = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
  }

  connect() {
    this.source = new EventSource("/sse");

    this.source.onopen = () => {
      this.isConnected = true;
      this.updateStatus("connected", "已连接");
    };

    this.source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.addMessage(data);
    };
  }
}
```

## 🎯 使用场景

### 适用场景

- **实时通知系统**: 消息推送、状态更新
- **监控面板**: 系统状态、性能指标实时展示
- **聊天应用**: 实时消息传输
- **数据可视化**: 实时图表数据更新
- **游戏状态同步**: 多人游戏状态同步

### 优势

- **低延迟**: 基于 HTTP 长连接，延迟极低
- **简单易用**: 相比 WebSocket 更简单
- **自动重连**: 内置重连机制
- **浏览器兼容**: 原生支持，无需额外库

## 🔍 调试和监控

### 调试工具

1. **浏览器开发者工具**: 查看网络请求和控制台日志
2. **服务器日志**: 查看连接状态和错误信息
3. **健康检查**: 通过 `/health` 接口监控服务器状态

### 常见问题

#### Q: 连接频繁断开怎么办？

A: 检查网络连接，确保服务器稳定运行。代码中已内置重连机制。

#### Q: 消息显示异常？

A: 检查浏览器控制台是否有错误信息，确认数据格式是否正确。

#### Q: 跨域访问问题？

A: 代码中已配置 CORS 支持，如仍有问题请检查服务器配置。

## 🚀 扩展功能

### 可以添加的功能

1. **消息持久化**: 将消息存储到数据库
2. **用户认证**: 添加用户登录和权限控制
3. **消息过滤**: 支持按类型或用户过滤消息
4. **文件上传**: 支持实时文件传输
5. **多房间支持**: 实现聊天室功能

### 性能优化

1. **连接池优化**: 使用 Redis 等缓存管理连接
2. **消息压缩**: 对大量数据进行压缩传输
3. **负载均衡**: 支持多服务器部署
4. **监控告警**: 添加系统监控和告警机制

## 📄 许可证

本项目采用 ISC 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

**注意**: 这是一个演示项目，生产环境使用前请根据实际需求进行安全性和性能优化。
