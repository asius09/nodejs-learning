const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

async function createReadMe() {
  // Recursively read the folder structure and return a nested object
  function readFoldersSync(dir) {
    let data = {};
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        data[file] = null;
      } else if (stats.isDirectory()) {
        data[file] = readFoldersSync(filePath);
      }
    }
    return data;
  }

  // Helper to print the tree structure as a string
  function printTree(obj, prefix = "") {
    const entries = Object.entries(obj);
    return entries
      .map(([key, value], idx) => {
        const isLast = idx === entries.length - 1;
        const branch = isLast ? "└── " : "├── ";
        const nextPrefix = prefix + (isLast ? "    " : "│   ");
        if (value === null) {
          return prefix + branch + key;
        } else {
          return prefix + branch + key + "\n" + printTree(value, nextPrefix);
        }
      })
      .join("\n");
  }

  // Get the folder structure
  const data = readFoldersSync("./");

  // Print the tree structure
  const readmeContent = printTree(data);

  // Write to README.md
  await fsp.writeFile("README.md", readmeContent, "utf8");
  console.log("README.md created with folder structure.");
}

createReadMe();
