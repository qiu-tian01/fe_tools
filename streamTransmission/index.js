const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// CORS配置（如果需要跨域访问）
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// 主页路由
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// SSE连接管理
const clients = new Set();

// SSE接口：专门用于后端向前端推数据
app.get("/sse", (req, res) => {
  // 设置响应头：告诉前端这是SSE流
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  res.flushHeaders();

  // 将客户端添加到连接池
  clients.add(res);

  // 发送连接成功消息
  res.write(
    `data: ${JSON.stringify({ type: "connection", message: "连接成功" })}\n\n`
  );

  // 客户端断开连接时的清理
  req.on("close", () => {
    clients.delete(res);
    console.log("客户端断开连接，当前连接数:", clients.size);
  });

  // 每1秒向前端推一次当前时间（模拟流式输出）
  const intervalId = setInterval(() => {
    if (res.destroyed) {
      clearInterval(intervalId);
      return;
    }

    try {
      const time = new Date().toLocaleTimeString();
      const data = {
        type: "time",
        message: time,
        timestamp: Date.now(),
      };
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error("发送SSE数据时出错:", error);
      clearInterval(intervalId);
    }
  }, 1000);
});

// 广播消息接口（可选功能）
app.post("/broadcast", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "消息不能为空" });
  }

  const data = {
    type: "broadcast",
    message: message,
    timestamp: Date.now(),
  };

  // 向所有连接的客户端广播消息
  clients.forEach((client) => {
    if (!client.destroyed) {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });

  res.json({ success: true, clientsCount: clients.size });
});

// 健康检查接口
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    activeConnections: clients.size,
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).json({ error: "服务器内部错误" });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: "接口不存在" });
});

app.listen(PORT, () => {
  console.log(`🚀 后端启动成功：http://localhost:${PORT}`);
  console.log(`📊 健康检查：http://localhost:${PORT}/health`);
});
