const fs = require("fs");
const path = require("path");

const artifactDir = "C:\\Users\\vallu\\.gemini\\antigravity-ide\\brain\\4d3798dd-3c31-463a-9811-1acf32934d13";
const files = fs.readdirSync(artifactDir);
console.log("All files in brain dir:", files.filter(f => f.startsWith("media_")));

// Sort files by mtime to get the most recent media files
const mediaFiles = files
  .filter(f => f.startsWith("media_"))
  .map(f => {
    const fullPath = path.join(artifactDir, f);
    return { name: f, time: fs.statSync(fullPath).mtimeMs, size: fs.statSync(fullPath).size };
  })
  .sort((a, b) => b.time - a.time);

console.log("Recent media files:", mediaFiles.slice(0, 5));
