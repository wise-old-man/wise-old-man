const { readdirSync, writeFileSync } = require("fs");
const { run } = require("spritesmith");
const path = require("path");

const config = {
  backgrounds: {
    dir: path.join(__dirname, "public/img/backgrounds"),
    output: path.join(__dirname, "public/img/backgrounds/spritesheet.png"),
    outputJson: path.join(__dirname, "public/img/backgrounds/spritesheet.json"),
  },
  group_roles: {
    dir: path.join(__dirname, "public/img/group_roles"),
    output: path.join(__dirname, "public/img/group_roles/spritesheet.png"),
    outputJson: path.join(__dirname, "public/img/group_roles/spritesheet.json"),
  },
  metrics: {
    dir: path.join(__dirname, "public/img/metrics"),
    output: path.join(__dirname, "public/img/metrics/spritesheet.png"),
    outputJson: path.join(__dirname, "public/img/metrics/spritesheet.json"),
  },
  metricsSmall: {
    dir: path.join(__dirname, "public/img/metrics_small"),
    output: path.join(__dirname, "public/img/metrics_small/spritesheet.png"),
    outputJson: path.join(__dirname, "public/img/metrics_small/spritesheet.json"),
  },
  playerTypes: {
    dir: path.join(__dirname, "public/img/player_types"),
    output: path.join(__dirname, "public/img/player_types/spritesheet.png"),
    outputJson: path.join(__dirname, "public/img/player_types/spritesheet.json"),
  },
};

for (const [key, value] of Object.entries(config)) {
  const { dir, output, outputJson } = value;

  const files = readdirSync(dir).filter((f) => f.endsWith(".png"));

  run({ src: files.map((f) => path.join(dir, f)) }, (err, result) => {
    if (err) throw err;

    writeFileSync(output, result.image, "binary");

    const coordMap = {};
    for (const [fullPath, coords] of Object.entries(result.coordinates)) {
      const fileName = path.basename(fullPath);
      coordMap[fileName] = coords;
    }

    writeFileSync(outputJson, JSON.stringify(coordMap, null, 2));
  });
}
