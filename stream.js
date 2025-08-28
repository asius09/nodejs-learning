const fs = require("fs");

const readStream = fs.createReadStream("text.txt", { encoding: "utf8" });

// Listen for 'data' events (chunks of file)
readStream.on("data", (chunk) => {
  console.log("Received chunk:", chunk.length, "characters");
});

// When reading is finished
readStream.on("end", () => {
  console.log("Finished reading file!");
});

// Handle errors
readStream.on("error", (err) => {
  console.error("Error reading file:", err);
});
