const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-9f11909697de438da75b605d02686036",
});

module.exports = async function deepseekstart() {
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "Bạn là trợ lý có thể giao tiếp với MCP MongoDB server. Là nhà phân tích số liệu thông minh \
        và đưa ra những nhận xét chuẩn của 1 chuyên gia quản lý kỹ thuật." },
      { role: "user", content: "em có kết nối được với mcp hiện tại đang cấu hình không? nếu có hãy cho anh biết có bao nhiên collection trong qtvl cho biết ko cần giải thích" },
    ],
        
    mcpServers: {
      mongodb: {
        command: "node",
        args: ["--no-warnings"],
        url: "http://115.79.38.161:28080/mcp",
      },
    },
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
};
