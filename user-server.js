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
  console.log("Writing Data", data);
  await fs.appendFile("user.txt", `${data.name},${data.email},${data.date}\n`);
}

getUsers();
// GET /api/users
// POST /api/users
// accept JSON only
// logs into file.

const server = http.createServer((req, res) => {
  if (req.url === "/api/users" && req.method === "GET") {
    //sends list of user's
    getUsers()
      .then((data) => {
        sendJSON(res, 200, data);
      })
      .catch((err) => {
        sendJSON(res, 500, { error: "Failed to get users" });
      });
  } else if (req.url === "/api/users" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        let userData;
        try {
          userData = JSON.parse(body);
        } catch (e) {
          sendJSON(res, 400, { error: "Invalid JSON" });
          return;
        }
        // Validate required fields
        if (!userData.name || !userData.email || !userData.date) {
          sendJSON(res, 400, { error: "Missing required fields" });
          return;
        }
        await writeUsers(userData);
        sendJSON(res, 200, { success: true });
      } catch (err) {
        sendJSON(res, 500, { error: "Failed to write user" });
      }
    });
  } else {
    sendJSON(res, 404, null);
  }
});
const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
