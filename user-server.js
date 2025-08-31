const http = require("http");
const fs = require("fs/promises");

// Helper

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function getUsers() {
  const users = await fs.readFile("user.txt");
  const userObjects = users
    .toString()
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const [name, email, date] = line.split(",");
      return { name, email, date };
    });
  return userObjects;
}
async function writeUsers(data) {
  await fs.appendFile("user.txt", `${data.name} ${data.email} ${data.date}\n`);
}

getUsers();
// GET /api/users
// POST /api/users
// accept JSON only
// logs into file.

const server = http.createServer(async (req, res) => {
  // middleware check if the req has json or not.
  if (req.url === "/api/users" && req.method === "GET") {
    //sends list of user's
    const data = await getUsers();
    sendJSON(res, 200, data);
  } else if (req.url === "/api/users" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    console.log(body);
    await writeUsers(body);
    sendJSON(res, 200, { success: true });
  } else {
    sendJSON(res, 404, null);
  }
});
const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
