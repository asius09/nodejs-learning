const fs = require("fs");
const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("greet", (name) => {
  console.log(`Hi, I'm ${name}`);
});

emitter.emit("greet", "Bobby");

const stream = fs.createReadStream("text.txt");

stream.on("data", (chunk) => {
  console.log("Received chunk:", chunk.toString());
});

stream.on("end", () => {
  console.log("No more data.");
});
