const { readdirSync, writeFileSync } = require("fs");
const { join } = require("path");
const { run } = require("spritesmith");
const { path } = require("path");

const metricsDir = path.join(__dirname, "public/img/metrics");
const outputImg = path.join(__dirname, "public/spritesheet.png");
const outputJson = path.join(__dirname, "public/spritesheet.json");

const files = readdirSync(metricsDir).filter((f) => f.endsWith(".png"));

run({ src: files.map((f) => join(metricsDir, f)) }, (err, result) => {
  if (err) throw err;

  writeFileSync(outputImg, result.image, "binary");

  const metricCoordMap = {};
  for (const [fullPath, coords] of Object.entries(result.coordinates)) {
    const fileName = path.basename(fullPath);
    metricCoordMap[fileName] = coords;
  }

  writeFileSync(outputJson, JSON.stringify(metricCoordMap, null, 2));

  console.log("✅ Sprite sheet generated");
});
