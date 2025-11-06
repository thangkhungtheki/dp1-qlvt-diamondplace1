import express from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 4000;

// Thông tin MCP server (MongoDB MCP Docker)
const MCP_SERVER_URL = "http://115.79.38.161:28080/mcp";

// 🧠 Kết nối MCP
const mcp = new Client({
  name: "mcp-proxy",
  version: "1.0.0",
});

let connected = false;

// Khởi tạo kết nối MCP HTTP transport
async function initMcp() {
  if (connected) return;
  const transport = new HttpClientTransport(MCP_SERVER_URL);
  await mcp.connect(transport);
  connected = true;
  console.log("✅ Đã kết nối tới MCP server:", MCP_SERVER_URL);
}

// 🧩 Gọi tool MCP
async function callTool(toolName, params = {}) {
  if (!connected) await initMcp();
  const result = await mcp.callTool(toolName, params);
  return result;
}

// 🌐 API REST đơn giản cho người dùng
app.get("/mcp", async (req, res) => {
  const { tool, params } = req.query;
  if (!tool)
    return res.status(400).json({ error: "Thiếu ?tool=" });

  try {
    const result = await callTool(tool, params ? JSON.parse(params) : {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌐 API test tool list
app.get("/tools", async (req, res) => {
  try {
    if (!connected) await initMcp();
    const tools = await mcp.listTools();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MCP Proxy đang chạy tại http://127.0.0.1:${PORT}`);
});
