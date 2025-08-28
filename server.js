const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Method", req.method);
  console.log("URL", req.url);

  res.writeHead(200, {"content-type" : "text/plain"});
  res.write("Hello from Node Server\n")
  res.end("Goodbye!");
});

const port = 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
