// tcp-server.js
const net = require("net");

const server = net.createServer((socket) => {
  console.log("🔗 Client connected!");

  // when data arrives from client
  socket.on("data", (data) => {
    console.log("📩 Received:", data.toString());
    socket.write("✅ Got your message: " + data.toString());
  });

  // when client disconnects
  socket.on("end", () => {
    console.log("❌ Client disconnected.");
  });
});

server.listen(8080, () => {
  console.log("🚀 TCP Server listening on port 8080");
});
