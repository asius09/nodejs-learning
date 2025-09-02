const fs = require("fs/promises");
const http = require("http");
const PATH = "tasks.txt";
const PORT = 3000;

// function TO SEND JSON
function sendJSON(res, data, status = 200) {
  console.log("Sending JSON response:", { status, data });
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function taskArrayIntoString(tasks) {
  console.log("Converting task array to string:", tasks);
  return tasks.map((task) => `${task.id},${task.task}`).join("\n");
}

// parseBody now returns a Promise and works with await
function parseBody(req, res) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      console.log("Received chunk:", chunk.toString());
    });
    req.on("end", () => {
      let response;
      try {
        response = JSON.parse(body);
        console.log("Parsed request body:", response);
      } catch (err) {
        console.error("Invalid JSON received:", body);
        sendJSON(res, { error: "Invalid JSON" }, 400);
        resolve(null);
        return;
      }
      if (!response) {
        console.error("Missing required fields in request body");
        sendJSON(res, { error: "Missing required fields" }, 400);
        resolve(null);
        return;
      }
      resolve(response);
    });
  });
}

async function getTasks() {
  try {
    console.log("Reading tasks from file:", PATH);
    const data = await fs.readFile(PATH);
    // TASK STRUC -> id - task
    const tasks = data
      .toString()
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((task) => {
        const [id, content] = task.split(",");
        return { id: id.trim(), task: content.trim() };
      });
    console.log("Loaded tasks:", tasks);
    return tasks;
  } catch (err) {
    if (err.code === "ENOENT") {
      // File does not exist, treat as empty
      console.warn("Tasks file not found, returning empty list.");
      return [];
    }
    console.error("Error reading tasks file:", err);
    throw err;
  }
}

async function createTask(createTask) {
  console.log("Creating task:", createTask);
  const { task } = createTask;
  try {
    const taskId = new Date().toISOString();
    await fs.appendFile(PATH, `${taskId},${task}\n`);
    return { id: taskId, task: task };
  } catch (err) {
    console.error("Error appending task:", err);
    throw err;
  }
}

async function updateTask(updateTask) {
  console.log("Updating task:", updateTask);
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.map((task) =>
      task.id === updateTask.id ? updateTask : task
    );
    const fileContent = taskArrayIntoString(updatedTasks);
    await fs.writeFile(PATH, fileContent + (fileContent ? "\n" : ""));
    console.log("Updated tasks written to file.");
  } catch (err) {
    console.error("Error updating task:", err);
    throw err;
  }
}

async function deleteTask(taskId) {
  console.log("Deleting task with id:", taskId);
  try {
    const tasks = await getTasks();
    const newTasks = tasks.filter((task) => task.id !== taskId);
    const fileContent = taskArrayIntoString(newTasks);
    await fs.writeFile(PATH, fileContent + (fileContent ? "\n" : ""));
    console.log("Task deleted and file updated.");
  } catch (err) {
    console.error("Error deleting task:", err);
    throw err;
  }
}
// METHODS
async function getHandler(req, res) {
  const tasks = await getTasks();
  if (tasks.length > 0) {
    sendJSON(res, tasks, 200);
  } else {
    console.log("No tasks present.");
    sendJSON(res, { message: "NO TASK PRESENT" }, 200);
  }
}

async function postHandler(req, res) {
  const task = await parseBody(req, res);
  if (!task || !task.task) {
    console.error("POST /api/tasks: Missing required fields");
    sendJSON(res, { error: "Missing required fields" }, 400);
    return;
  }
  const response = await createTask(task);
  sendJSON(res, { success: true, data: response }, 201);
}

async function deleteHandler(req, res) {
  console.log(`http://${req.headers.host}`);
  console.log(`Request Url`, req.url);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get("id");
  console.log("post Id ", id);
  if (!id) {
    console.error("DELETE /api/tasks: Missing required fields");
    sendJSON(res, { error: "Missing required fields" }, 400);
    return;
  }
  await deleteTask(id);
  sendJSON(res, { success: true }, 200);
}

async function putHandler(req, res) {
  const task = await parseBody(req, res);
  if (!task || !task.id || !task.task) {
    if (task !== null) {
      console.error("PUT /api/tasks: Missing required fields");
      sendJSON(res, { error: "Missing required fields" }, 400);
    }
    return;
  }
  await updateTask(task);
  sendJSON(res, { success: true }, 200);
}

const routes = {
  GET: getHandler,
  POST: postHandler,
  PUT: putHandler,
  DELETE: deleteHandler,
};

//now create server
const server = http.createServer(async (req, res) => {
  try {
    const url = req.url;
    if (url.startsWith("/api/tasks")) {
      const method = req.method;
      if (routes[method]) {
        routes[method](req, res);
      } else {
        console.warn("Method not allowed:", method, url);
        sendJSON(res, { error: "Method Not Allowed" }, 405);
      }
    } else {
      console.warn("Route not found:", req.method, req.url);
      sendJSON(res, { error: "NOT FOUND" }, 404);
    }
  } catch (err) {
    console.error("Internal server error:", err);
    sendJSON(res, { error: "Internal server error" }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Server Listening on ${PORT}`);
});
