fs = require("fs");

const readFileAsPromise = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const parseJson = async (jsonFile) => {
  return readFileAsPromise(jsonFile)
    .then((data) => {
      return JSON.parse(data);
    })
    .catch((err) => {
      throw err;
    });
};

parseJson("./markets.geojson").then((data) => {
  const ids = data.features.map(feature => parseInt(feature.properties.id)).sort((a, b) => a - b);
  let min = 1, max = 1;
  const missing = [];
  for (const id of ids) {
    if (id > max + 1) {
      missing.push((max+1) + "-" + (id-1));
      min = id;
      max = id;
    } else {
      max = id;
    }
  }
  // 2022: https://github.com/CodeforLeipzig/weihnachtsmarktkarte/blob/b6df0b59b12b1c98a3708b9f8ac3d4d0f8960275/scraper/markets.geojson?short_path=9ca509e
  // 2023: https://raw.githubusercontent.com/CodeforLeipzig/weihnachtsmarktkarte/e7c0e19413d300d3d1f723245321e05bc0a5eaf8/scraper/markets.geojson
  // missing: 82, 84, 86, 91, 92, 93, 94, 95
  // 2024: https://raw.githubusercontent.com/CodeforLeipzig/weihnachtsmarktkarte/1b9b5de300a3749f6ebd8209d20d0c34cd3514b0/scraper/markets.geojson
  // missing: 35, 43, 63, 74, 75, 82, 84, 85, 86, 91, 92, 93, 94, 95
  
  console.log("missing ids: " + missing);
});