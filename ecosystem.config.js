module.exports = {
    apps : [
      {
        name: "webdp1",
        script: "index.js", // Ví dụ: index.js
        node_args: "--max-old-space-size=200", // Rất quan trọng, hãy chắc chắn là số này lớn hơn 33.76, ví dụ 200
        // ... các tham số khác
      }
    ]
  };