const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "POST") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("HOME PAGE");
  } else if (req.url === "/about" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ABOUT PAGE");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("NOT FOUND PAGE");
  }
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
