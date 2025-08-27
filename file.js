const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

async function logRun() {
  try {
    const now = new Date().toISOString();
    await fsp.appendFile("log.txt", `Run at: ${now}\n`);
    console.log("Log Saved");
  } catch (err) {
    console.log("error while log", err);
  }
}

// logRun();

function getLogFilePath() {
  const date = new Date().toISOString().split("T")[0];
  const logDir = "logs";

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir); //create folder if missing
  }
  const logPath = path.join(logDir, `app-${date}.log`);
  console.log("Log Path", logPath);
}

// getLogFilePath();

function createTestFoler() {
  fs.mkdir("test/hello/world", { recursive: true }, (err) => {
    if (err) throw err;
    console.log("foler created!");
  });
}
// createTestFoler();

function readDirectory() {
  fs.readdir("./", (err, files) => {
    if (err) throw err;
    console.log(files);
  });
}

// readDirectory();


