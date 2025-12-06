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
    data.features.forEach(feature => {
        if (!feature.properties.image) {
            console.log("Missing image: " + feature.properties.name);
        }
    });
});